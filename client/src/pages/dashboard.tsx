import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import LoadCard from "@/components/load-card";
import MapView from "@/components/map-view";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { SelectLoad } from "@db/schema";

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const { data: loads, refetch } = useQuery<SelectLoad[]>({
    queryKey: ["/api/loads"],
  });

  const bookLoad = useMutation({
    mutationFn: async (loadId: number) => {
      const res = await fetch(`/api/loads/${loadId}/book`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Load booked successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      origin: "",
      destination: "",
      weight: "",
      price: "",
      equipmentType: "",
      pickupDate: "",
      deliveryDate: "",
      description: "",
    },
  });

  const createLoad = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Load created successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user?.userType === "shipper" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Post New Load</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Load</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createLoad.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* Add other form fields similarly */}
                  <Button type="submit">Create Load</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <MapView loads={loads || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loads?.map((load) => (
          <LoadCard
            key={load.id}
            load={load}
            onBook={() => bookLoad.mutate(load.id)}
            showBookButton={user?.userType === "carrier"}
          />
        ))}
      </div>
    </div>
  );
}
