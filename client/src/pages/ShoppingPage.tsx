import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Loader2, ShoppingBasket, RotateCcw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ShoppingList, ShoppingListItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ShoppingPage() {
  const { toast } = useToast();
  const [newListName, setNewListName] = useState("");
  const { data: lists, isLoading } = useQuery<(ShoppingList & { items: ShoppingListItem[] })[]>({
    queryKey: ["/api/shopping"],
  });

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/shopping", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      setNewListName("");
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shopping/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      toast({ title: "הרשימה נמחקה" });
    },
  });

  const resetListMutation = useMutation({
    mutationFn: async (id: number) => {
      const list = lists?.find(l => l.id === id);
      if (!list) return;
      for (const item of list.items) {
        if (item.isCompleted) {
          await apiRequest("PATCH", `/api/shopping/items/${item.id}`, { isCompleted: false });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
      toast({ title: "הרשימה אופסה" });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ listId, name, amount }: { listId: number; name: string; amount: string }) => {
      const res = await apiRequest("POST", `/api/shopping/${listId}/items`, { name, amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      await apiRequest("PATCH", `/api/shopping/items/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shopping/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBasket className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">רשימת קניות</h2>
        </div>

        <div className="flex gap-2 mb-8">
          <Input 
            placeholder="שם הרשימה (למשל: קניות שבועיות)" 
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="text-right"
          />
          <Button onClick={() => createListMutation.mutate(newListName)} disabled={!newListName || createListMutation.isPending}>
            <Plus className="w-4 h-4 ml-2" />
            צור רשימה
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lists?.map((list) => (
            <Card key={list.id} className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{list.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => resetListMutation.mutate(list.id)} title="אפס רשימה" className="h-8 w-8">
                    <RotateCcw className={cn("h-4 w-4", resetListMutation.isPending && "animate-spin")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteListMutation.mutate(list.id)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AddItemForm listId={list.id} onAdd={(name, amount) => addItemMutation.mutate({ listId: list.id, name, amount })} />
                  <div className="space-y-2 mt-4">
                    {list.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={item.isCompleted} 
                            onCheckedChange={(checked) => updateItemMutation.mutate({ id: item.id, isCompleted: !!checked })}
                          />
                          <div className={item.isCompleted ? "line-through text-muted-foreground" : ""}>
                            <span className="font-medium">{item.name}</span>
                            {item.amount && <span className="text-sm mr-2 opacity-70">({item.amount})</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteItemMutation.mutate(item.id)} className="h-8 w-8 text-muted-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function AddItemForm({ listId, onAdd }: { listId: number; onAdd: (name: string, amount: string) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="flex gap-2">
      <Input 
        placeholder="מוצר" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        className="text-right flex-1"
      />
      <Input 
        placeholder="כמות" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)}
        className="text-right w-20"
      />
      <Button size="icon" onClick={() => { if(name) { onAdd(name, amount); setName(""); setAmount(""); } }}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}