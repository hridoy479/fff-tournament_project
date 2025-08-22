"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "@/hooks/useAuth";

interface IAlert {
  _id: string;
  message: string;
  isActive: boolean;
}

import { Loader2 } from "lucide-react";

const AlertManagement = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const getHeaders = async () => {
    if (!user) return { "Content-Type": "application/json" };
    const token = await user.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAlerts = async () => {
    if (!user) return;
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/alerts", { headers });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);


  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setIsAdding(true);
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: newMessage, isActive: true }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchAlerts();
      }
    } catch (error) {
      console.error("Failed to add alert", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    if (!user) return;
    setTogglingId(id);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/alerts/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error("Failed to toggle alert", error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/alerts/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete alert", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddAlert} className="flex gap-2 mb-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="New alert message"
          />
          <Button type="submit" disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Alert"}
          </Button>
        </form>

        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert._id} className="flex items-center justify-between p-2 border rounded-md">
              <p>{alert.message}</p>
              <div className="flex items-center gap-2">
                {togglingId === alert._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={alert.isActive}
                    onCheckedChange={() => handleToggleAlert(alert._id, alert.isActive)}
                    disabled={togglingId === alert._id}
                  />
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAlert(alert._id)}
                  disabled={deletingId === alert._id}
                >
                  {deletingId === alert._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertManagement;