'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Countdown from 'react-countdown';

type Numeric = number | '';

const AddTournamentPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [entryFee, setEntryFee] = useState<Numeric>('');
  const [prize, setPrize] = useState('');
  const [joinedPlayers, setJoinedPlayers] = useState<Numeric>('');
  const [maxPlayers, setMaxPlayers] = useState<Numeric>('');
  const [category, setCategory] = useState('');
  const [ffGameType, setFfGameType] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');

  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreview(url);
    }
  };

  const handleNumericChange = (
    setter: React.Dispatch<React.SetStateAction<Numeric>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setter(value === '' ? '' : Number(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to add a tournament.');
        return;
      }

      let finalImageUrl = '';
      if (imageInputMethod === 'upload' && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      } else if (imageInputMethod === 'url' && imageUrl) {
        finalImageUrl = imageUrl;
      }

      await axios.post('/api/tournaments', {
        title,
        date,
        image: finalImageUrl,
        entry_fee: entryFee === '' ? 0 : entryFee,
        prize,
        joined_players: joinedPlayers === '' ? 0 : joinedPlayers,
        max_players: maxPlayers === '' ? 0 : maxPlayers,
        category,
        ffGameType: category === 'freefire' ? ffGameType : undefined,
        description,
        status,
        userId: user.uid,
      });

      toast.success('Tournament added successfully!');
      router.push('/tournaments');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add tournament.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated for image upload.');
    }
    const idToken = await user.getIdToken();

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (response.data.success) {
        return response.data.url;
      } else {
        throw new Error(response.data.message || 'Image upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.response?.data?.message || 'Image upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Create Tournament
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details to create an exciting new tournament
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Tournament Information</CardTitle>
              <CardDescription>
                Provide all necessary details for your tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="details">Tournament Details</TabsTrigger>
                  <TabsTrigger value="settings">Settings & Rules</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit}>
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tournament Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter tournament title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your tournament"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date & Time *</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="freefire">Free Fire</SelectItem>
                            <SelectItem value="efootball">E FootBall</SelectItem>
                            <SelectItem value="ludo">Ludo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {category === 'freefire' && (
                      <div className="space-y-2">
                        <Label htmlFor="ff-game-type">Free Fire Game Type</Label>
                        <Select value={ffGameType} onValueChange={setFfGameType}>
                          <SelectTrigger id="ff-game-type">
                            <SelectValue placeholder="Select a game type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CS">CS</SelectItem>
                            <SelectItem value="BR">BR</SelectItem>
                            <SelectItem value="Lonewolf">Lonewolf</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="image-method"
                          checked={imageInputMethod === 'url'}
                          onCheckedChange={(checked) => setImageInputMethod(checked ? 'url' : 'upload')}
                        />
                        <Label htmlFor="image-method" className="cursor-pointer">
                          {imageInputMethod === 'upload' ? 'Upload Image' : 'Use Image URL'}
                        </Label>
                      </div>

                      {imageInputMethod === 'upload' ? (
                        <div className="space-y-2">
                          <Label htmlFor="image-upload">Tournament Image</Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="image-url">Image URL</Label>
                          <Input
                            id="image-url"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={handleImageUrlChange}
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('settings')}
                      >
                        Next: Settings
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="started">Started</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="entryFee">Entry Fee ($)</Label>
                        <Input
                          id="entryFee"
                          type="number"
                          placeholder="0.00"
                          value={entryFee}
                          onChange={handleNumericChange(setEntryFee)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prize">Prize Pool</Label>
                      <Input
                        id="prize"
                        placeholder="e.g., $10,000"
                        value={prize}
                        onChange={(e) => setPrize(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinedPlayers">Joined Players</Label>
                        <Input
                          id="joinedPlayers"
                          type="number"
                          placeholder="0"
                          value={joinedPlayers}
                          onChange={handleNumericChange(setJoinedPlayers)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxPlayers">Maximum Players *</Label>
                        <Input
                          id="maxPlayers"
                          type="number"
                          placeholder="100"
                          value={maxPlayers}
                          onChange={handleNumericChange(setMaxPlayers)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab('details')}
                      >
                        Back to Details
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="min-w-[140px]"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Creating...
                          </>
                        ) : (
                          'Create Tournament'
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="lg:w-96">
            <CardHeader>
              <CardTitle>Tournament Preview</CardTitle>
              <CardDescription>How your tournament will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Tournament preview" className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image selected</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{title || "Tournament Title"}</h3>
                  {description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {status}
                    </span>
                    <span className="font-bold text-primary">
                      {entryFee ? `$${entryFee}` : 'Free'} Entry
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{joinedPlayers || 0}/{maxPlayers || '∞'} Players</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{date ? new Date(date).toLocaleString() : 'Date not set'}</span>
                    </div>
                  </div>

                  {date && (
                    <div className="mb-4">
                      <Countdown date={date} renderer={({ days, hours, minutes, seconds, completed }) => {
                        if (completed) {
                          return <div className="text-center text-red-500 font-bold">Tournament has started!</div>;
                        }
                        return (
                          <div className="flex justify-center items-center space-x-2 text-center">
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg min-w-[40px]">
                              <div className="text-lg font-bold">{days}</div>
                              <div className="text-xs">Days</div>
                            </div>
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg min-w-[40px]">
                              <div className="text-lg font-bold">{hours}</div>
                              <div className="text-xs">Hours</div>
                            </div>
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg min-w-[40px]">
                              <div className="text-lg font-bold">{minutes}</div>
                              <div className="text-xs">Mins</div>
                            </div>
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg min-w-[40px]">
                              <div className="text-lg font-bold">{seconds}</div>
                              <div className="text-xs">Secs</div>
                            </div>
                          </div>
                        );
                      }} />
                    </div>
                  )}
                  
                  <div className="rounded-lg bg-muted p-3 mb-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Prize Pool</div>
                    <div className="font-bold text-lg">{prize || 'TBD'}</div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">Category: {category || 'Not specified'}</div>
                  
                  <Button className="w-full">Join Tournament</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddTournamentPage;
