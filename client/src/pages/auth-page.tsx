import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { TbTruckDelivery } from "react-icons/tb";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["carrier", "shipper"]),
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
  phone: z.string().regex(/^\+212\s\d{3}-\d{6}$/, "Please enter a valid Moroccan phone number").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
      userType: "shipper",
      companyName: "",
      phone: "",
      email: "",
    },
    mode: "onChange"
  });

  const onSubmit = async (data: AuthForm) => {
    try {
      setIsSubmitting(true);
      if (isLogin) {
        await login(data);
      } else {
        await register(data);
      }
      toast({
        title: isLogin ? "Login successful" : "Registration successful",
        description: "Welcome to FreightConnect Morocco!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white px-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl border-0 rounded-2xl transform transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="space-y-4 pt-8">
          <div className="flex justify-center">
            <TbTruckDelivery className="h-12 w-12 text-gray-700 animate-bounce" />
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Join FreightConnect"}
          </CardTitle>
          <p className="text-center text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create your account to get started"}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Username</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors duration-200" 
                        placeholder="Enter your username"
                        autoComplete="username"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors duration-200" 
                        placeholder="Enter your password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLogin && (
                <>
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Account Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            disabled={isSubmitting}
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="shipper" className="text-gray-600" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Shipper
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="carrier" className="text-gray-600" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Carrier
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors duration-200" 
                            placeholder="Enter company name"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors duration-200" 
                            placeholder="+212 XXX-XXXXXX"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            {...field} 
                            className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:border-gray-500 focus:ring-gray-500 transition-colors duration-200" 
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-gray-600 transition-colors underline-offset-4 hover:underline"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              disabled={isSubmitting}
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
