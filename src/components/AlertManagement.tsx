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

const AlertManagement = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [newMessage, setNewMessage] = useState("");

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
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    if (!user) return;
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
          <Button type="submit">Add Alert</Button>
        </form>

        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert._id} className="flex items-center justify-between p-2 border rounded-md">
              <p>{alert.message}</p>
              <Switch
                checked={alert.isActive}
                onCheckedChange={() => handleToggleAlert(alert._id, alert.isActive)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertManagement;