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
import { PriceSuggestion } from "@/components/price-suggestion";
import { CarrierRecommendations } from "@/components/carrier-recommendations";

interface LoadFormData {
  origin: string;
  destination: string;
  weight: string;
  price: string;
  equipmentType: string;
  pickupDate: string;
  deliveryDate: string;
  description: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

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

  const form = useForm<LoadFormData>({
    defaultValues: {
      origin: "",
      destination: "",
      weight: "",
      price: "",
      equipmentType: "",
      pickupDate: "",
      deliveryDate: "",
      description: "",
      originLat: 0,
      originLng: 0,
      destinationLat: 0,
      destinationLng: 0,
    },
  });

  const createLoad = useMutation({
    mutationFn: async (data: LoadFormData) => {
      // Convert string values to numbers where needed
      const formattedData = {
        ...data,
        weight: parseInt(data.weight),
        price: parseInt(data.price),
      };

      const res = await fetch("/api/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post a New Load</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createLoad.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="equipmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment Type</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originLat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originLng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destinationLat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destinationLng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />


                  </div>

                  {form.watch("origin") && form.watch("destination") && form.watch("weight") && form.watch("equipmentType") && form.watch("pickupDate") && (
                    <PriceSuggestion
                      loadData={{
                        originLat: form.watch("originLat"),
                        originLng: form.watch("originLng"),
                        destinationLat: form.watch("destinationLat"),
                        destinationLng: form.watch("destinationLng"),
                        weight: parseInt(form.watch("weight") || "0"),
                        equipmentType: form.watch("equipmentType"),
                        pickupDate: form.watch("pickupDate"),
                      }}
                    />
                  )}

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
          <div key={load.id} className="space-y-4">
            <LoadCard
              load={load}
              onBook={() => bookLoad.mutate(load.id)}
              showBookButton={user?.userType === "carrier"}
            />
            {user?.userType === "shipper" && load.status === "available" && (
              <CarrierRecommendations
                load={load}
                onSelect={(carrierId) => {
                  // Handle carrier selection
                  console.log("Selected carrier:", carrierId);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}