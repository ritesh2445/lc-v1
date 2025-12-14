import { useState, useEffect } from "react";
import { Lock, Calendar, MessageSquare, Quote, Save, Plus, Edit, Trash2, HelpCircle, Users, Phone, Bell, Image as ImageIcon, Upload, Video } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schemas
const whatsappSchema = z.object({
  whatsapp_contact: z.string().min(1).max(100).trim(),
});

const eventSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  date: z.string().min(1),
  time: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(1000).trim(),
  location: z.string().min(1).max(200).trim(),
  is_booking_open: z.boolean().default(true),
  slots_status: z.string().max(200).trim().optional(),
});

const testimonialSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  role: z.string().min(1).max(100).trim(),
  video_url: z.string().max(500).trim().optional(),
  thumbnail_url: z.string().max(500).trim().optional(),
});

const quoteSchema = z.object({
  text: z.string().min(1).max(500).trim(),
  author: z.string().max(100).trim().optional(),
});

const faqSchema = z.object({
  question: z.string().min(1).max(500).trim(),
  answer: z.string().min(1).max(2000).trim(),
  display_order: z.number().int().min(0).default(0),
});

const volunteerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  role: z.string().min(1).max(100).trim(),
  quote: z.string().min(1).max(500).trim(),
  image_url: z.string().max(500).trim().optional(),
  display_order: z.number().int().min(0).default(0),
});

const contactSchema = z.object({
  email: z.string().email().max(255).trim().optional(),
  phone: z.string().max(50).trim().optional(),
  address: z.string().max(500).trim().optional(),
  instagram_url: z.string().url().max(500).trim().optional(),
  linkedin_url: z.string().url().max(500).trim().optional(),
});

const postSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(2000).trim(),
  type: z.enum(['news', 'notification', 'alert', 'event_cancellation']).default('news'),
});

const gallerySchema = z.object({
  image_url: z.string().url().max(500).trim(),
  caption: z.string().max(500).trim().optional(),
  display_order: z.number().int().min(0).default(0),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;
type EventFormValues = z.infer<typeof eventSchema>;
type TestimonialFormValues = z.infer<typeof testimonialSchema>;
type QuoteFormValues = z.infer<typeof quoteSchema>;
type FAQFormValues = z.infer<typeof faqSchema>;
type VolunteerFormValues = z.infer<typeof volunteerSchema>;
type ContactFormValues = z.infer<typeof contactSchema>;
type PostFormValues = z.infer<typeof postSchema>;
type GalleryFormValues = z.infer<typeof gallerySchema>;

const Admin = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingVolunteerImage, setUploadingVolunteerImage] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedVolunteerImageFile, setSelectedVolunteerImageFile] = useState<File | null>(null);
  
  const whatsappForm = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { whatsapp_contact: "" },
  });

  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      description: "",
      location: "",
      is_booking_open: true,
      slots_status: "",
    },
  });

  const testimonialForm = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      video_url: "",
      thumbnail_url: "",
    },
  });

  const quoteForm = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      text: "",
      author: "",
    },
  });

  const faqForm = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      display_order: 0,
    },
  });

  const volunteerForm = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      name: "",
      role: "",
      quote: "",
      image_url: "",
      display_order: 0,
    },
  });

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      instagram_url: "",
      linkedin_url: "",
    },
  });

  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "news",
    },
  });

  const galleryForm = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      image_url: "",
      caption: "",
      display_order: 0,
    },
  });

  useEffect(() => {
    fetchWhatsAppContact();
    fetchEvents();
    fetchTestimonials();
    fetchQuotes();
    fetchFAQs();
    fetchVolunteers();
    fetchContactInfo();
  }, []);

  const fetchWhatsAppContact = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_contact")
      .maybeSingle();
    if (data) whatsappForm.reset({ whatsapp_contact: data.value });
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: true });
    if (data) setEvents(data);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (data) setTestimonials(data);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (data) setQuotes(data);
  };

  const fetchFAQs = async () => {
    const { data } = await supabase.from("faqs").select("*").order("display_order", { ascending: true });
    if (data) setFaqs(data);
  };

  const fetchVolunteers = async () => {
    const { data } = await supabase.from("volunteers").select("*").order("display_order", { ascending: true });
    if (data) setVolunteers(data);
  };

  const fetchContactInfo = async () => {
    const { data } = await supabase.from("contact_info").select("*").maybeSingle();
    if (data) {
      setContactInfo(data);
      contactForm.reset(data);
    }
  };

  const onWhatsAppSubmit = async (values: WhatsAppFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("settings").upsert({
        key: "whatsapp_contact",
        value: values.whatsapp_contact.trim(),
      }, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Success", description: "WhatsApp contact updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onEventSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    try {
      const eventData = {
        name: values.name,
        date: values.date,
        time: values.time,
        description: values.description,
        location: values.location,
        is_booking_open: values.is_booking_open,
        slots_status: values.slots_status || null,
      };
      
      if (editingItem?.id) {
        const { error } = await supabase.from("events").update(eventData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        const { error } = await supabase.from("events").insert([eventData]);
        if (error) throw error;
        toast({ title: "Success", description: "Event created successfully" });
      }
      fetchEvents();
      setDialogOpen(false);
      setEditingItem(null);
      eventForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Video file must be less than 10MB", variant: "destructive" });
      return null;
    }

    setUploadingVideo(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('testimonial-videos')
      .upload(fileName, file);

    setUploadingVideo(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('testimonial-videos').getPublicUrl(fileName);
    return publicUrl;
  };

  const onTestimonialSubmit = async (values: TestimonialFormValues) => {
    setIsLoading(true);
    try {
      // Check limit of 12 testimonials (only when adding new)
      if (!editingItem?.id && testimonials.length >= 12) {
        toast({ title: "Error", description: "Maximum of 12 testimonials allowed", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      let videoUrl = values.video_url || "";
      
      // Upload video file if selected
      if (selectedVideoFile) {
        const uploadedUrl = await uploadVideo(selectedVideoFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        videoUrl = uploadedUrl;
      }

      if (!videoUrl) {
        toast({ title: "Error", description: "Please provide a video URL or upload a video file", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const testimonialData = {
        name: values.name,
        role: values.role,
        video_url: videoUrl,
        thumbnail_url: values.thumbnail_url || null,
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("testimonials").update(testimonialData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Testimonial updated successfully" });
      } else {
        const { error } = await supabase.from("testimonials").insert([testimonialData]);
        if (error) throw error;
        toast({ title: "Success", description: "Testimonial created successfully" });
      }
      fetchTestimonials();
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedVideoFile(null);
      testimonialForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onQuoteSubmit = async (values: QuoteFormValues) => {
    setIsLoading(true);
    try {
      if (editingItem?.id) {
        const { error } = await supabase.from("quotes").update(values as any).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Quote updated successfully" });
      } else {
        const { error } = await supabase.from("quotes").insert([{ ...values, is_active: true } as any]);
        if (error) throw error;
        toast({ title: "Success", description: "Quote created successfully" });
      }
      fetchQuotes();
      setDialogOpen(false);
      setEditingItem(null);
      quoteForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onFAQSubmit = async (values: FAQFormValues) => {
    setIsLoading(true);
    try {
      if (editingItem?.id) {
        const { error } = await supabase.from("faqs").update(values as any).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "FAQ updated successfully" });
      } else {
        const { error } = await supabase.from("faqs").insert([{ ...values, is_active: true } as any]);
        if (error) throw error;
        toast({ title: "Success", description: "FAQ created successfully" });
      }
      fetchFAQs();
      setDialogOpen(false);
      setEditingItem(null);
      faqForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVolunteerImage = async (file: File): Promise<string | null> => {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Image file must be less than 5MB", variant: "destructive" });
      return null;
    }

    setUploadingVolunteerImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('volunteer-images')
      .upload(fileName, file);

    setUploadingVolunteerImage(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('volunteer-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const onVolunteerSubmit = async (values: VolunteerFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = values.image_url || "";
      
      // Upload image file if selected
      if (selectedVolunteerImageFile) {
        const uploadedUrl = await uploadVolunteerImage(selectedVolunteerImageFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (!imageUrl) {
        toast({ title: "Error", description: "Please provide an image URL or upload an image file", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const volunteerData = {
        name: values.name,
        role: values.role,
        quote: values.quote,
        image_url: imageUrl,
        display_order: values.display_order,
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("volunteers").update(volunteerData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Volunteer updated successfully" });
      } else {
        const { error } = await supabase.from("volunteers").insert([{ ...volunteerData, is_active: true }]);
        if (error) throw error;
        toast({ title: "Success", description: "Volunteer created successfully" });
      }
      fetchVolunteers();
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedVolunteerImageFile(null);
      volunteerForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onContactSubmit = async (values: ContactFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("contact_info").upsert({
        id: contactInfo?.id || undefined,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        instagram_url: values.instagram_url || null,
        linkedin_url: values.linkedin_url || null,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Contact information updated successfully" });
      fetchContactInfo();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    }
  };

  const deleteTestimonial = async (id: string, videoUrl?: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Delete video from storage if it's an uploaded video
      if (videoUrl && videoUrl.includes('testimonial-videos')) {
        const fileName = videoUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('testimonial-videos').remove([fileName]);
        }
      }
      toast({ title: "Success", description: "Testimonial deleted successfully" });
      fetchTestimonials();
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Quote deleted successfully" });
      fetchQuotes();
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "FAQ deleted successfully" });
      fetchFAQs();
    }
  };

  const deleteVolunteer = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this volunteer?")) return;
    const { error } = await supabase.from("volunteers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Delete image from storage if it's an uploaded image
      if (imageUrl && imageUrl.includes('volunteer-images')) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('volunteer-images').remove([fileName]);
        }
      }
      toast({ title: "Success", description: "Volunteer deleted successfully" });
      fetchVolunteers();
    }
  };

  // Posts functions
  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error && data) setPosts(data);
  };

  const onPostSubmit = async (data: PostFormValues) => {
    setIsLoading(true);
    const { error } = editingItem?.id
      ? await supabase.from("posts").update(data as any).eq("id", editingItem.id)
      : await supabase.from("posts").insert([data as any]);

    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Post ${editingItem?.id ? "updated" : "created"} successfully` });
      setDialogOpen(false);
      setEditingItem(null);
      postForm.reset();
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Post deleted successfully" });
      fetchPosts();
    }
  };

  // Gallery functions
  const fetchGalleryImages = async () => {
    const { data, error } = await supabase.from("gallery_images").select("*").order("display_order", { ascending: true });
    if (!error && data) setGalleryImages(data);
  };

  const onGallerySubmit = async (data: GalleryFormValues) => {
    setIsLoading(true);
    
    // Check limit of 25 images
    if (!editingItem?.id && galleryImages.length >= 25) {
      toast({ title: "Error", description: "Maximum of 25 images allowed", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { error } = editingItem?.id
      ? await supabase.from("gallery_images").update(data as any).eq("id", editingItem.id)
      : await supabase.from("gallery_images").insert([data as any]);

    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Image ${editingItem?.id ? "updated" : "uploaded"} successfully` });
      setDialogOpen(false);
      setEditingItem(null);
      galleryForm.reset();
      fetchGalleryImages();
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('memory-lane')
      .upload(fileName, file);

    setUploadingImage(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('memory-lane').getPublicUrl(fileName);
    return publicUrl;
  };

  const deleteGalleryImage = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    // Delete from database
    const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", id);
    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
      return;
    }

    // Delete from storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('memory-lane').remove([fileName]);
    }

    toast({ title: "Success", description: "Image deleted successfully" });
    fetchGalleryImages();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Lock className="mx-auto text-primary mb-6" size={64} />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Admin Dashboard
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
            Manage all content for the ListeningClub community.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* WhatsApp Configuration */}
            <Card className="shadow-soft border-border animate-fade-in mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} />
                  WhatsApp Configuration
                </CardTitle>
                <CardDescription>
                  Set the WhatsApp phone number for event bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...whatsappForm}>
                  <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-4">
                    <FormField
                      control={whatsappForm.control}
                      name="whatsapp_contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a phone number (e.g., 1234567890)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="shadow-soft">
                      <Save className="mr-2" size={18} />
                      {isLoading ? "Saving..." : "Save Configuration"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Management Tabs */}
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="posts">Updates</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'event'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); eventForm.reset(); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'event' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Event</DialogTitle>
                      <DialogDescription>Fill in the event details below</DialogDescription>
                    </DialogHeader>
                    <Form {...eventForm}>
                      <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
                        <FormField control={eventForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={eventForm.control} name="date" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl><Input type="date" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={eventForm.control} name="time" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl><Input placeholder="6:00 PM - 7:30 PM" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={eventForm.control} name="location" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={eventForm.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={eventForm.control} name="is_booking_open" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Booking Open</FormLabel>
                              <FormDescription>Allow users to book this event</FormDescription>
                            </div>
                          </FormItem>
                        )} />
                        <FormField control={eventForm.control} name="slots_status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slots Status (optional)</FormLabel>
                            <FormControl><Input placeholder="e.g., Slots Full, Limited Seats" {...field} /></FormControl>
                            <FormDescription>Display a custom message about slot availability</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Event"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {events.map(event => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                            <p className="mt-2">{event.description}</p>
                            <div className="mt-2 flex gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${event.is_booking_open ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                                {event.is_booking_open ? 'Booking Open' : 'Booking Closed'}
                              </span>
                              {event.slots_status && (
                                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                                  {event.slots_status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...event, type: 'event' }); 
                              eventForm.reset({
                                name: event.name,
                                date: event.date,
                                time: event.time,
                                description: event.description,
                                location: event.location,
                                is_booking_open: event.is_booking_open ?? true,
                                slots_status: event.slots_status || "",
                              }); 
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {testimonials.length}/12 testimonials
                  </p>
                  <Dialog open={dialogOpen && editingItem?.type === 'testimonial'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); testimonialForm.reset(); setSelectedVideoFile(null); } }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => { setEditingItem({ type: 'testimonial' }); setDialogOpen(true); }} 
                        disabled={testimonials.length >= 12}
                      >
                        <Plus className="mr-2" size={18} />
                        Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Testimonial</DialogTitle>
                        <DialogDescription>Fill in the testimonial details below. Max video size: 10MB</DialogDescription>
                      </DialogHeader>
                      <Form {...testimonialForm}>
                        <form onSubmit={testimonialForm.handleSubmit(onTestimonialSubmit)} className="space-y-4">
                          <FormField control={testimonialForm.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={testimonialForm.control} name="role" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          
                          {/* Video Upload Section */}
                          <div className="space-y-3">
                            <Label>Video</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                      toast({ title: "Error", description: "Video must be less than 10MB", variant: "destructive" });
                                      e.target.value = "";
                                      return;
                                    }
                                    setSelectedVideoFile(file);
                                    testimonialForm.setValue("video_url", "");
                                  }
                                }}
                                className="hidden"
                                id="video-upload"
                              />
                              <label htmlFor="video-upload" className="cursor-pointer">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  {selectedVideoFile ? selectedVideoFile.name : "Click to upload video (max 10MB)"}
                                </p>
                              </label>
                              {selectedVideoFile && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => setSelectedVideoFile(null)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Or provide a video URL below</p>
                          </div>

                          <FormField control={testimonialForm.control} name="video_url" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL (optional if uploading)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="https://youtube.com/watch?v=..."
                                  disabled={!!selectedVideoFile}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={testimonialForm.control} name="thumbnail_url" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thumbnail URL (optional)</FormLabel>
                              <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <Button type="submit" disabled={isLoading || uploadingVideo} className="w-full">
                            {uploadingVideo ? "Uploading video..." : isLoading ? "Saving..." : "Save Testimonial"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {testimonials.map(testimonial => (
                    <Card key={testimonial.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{testimonial.name}</h3>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{testimonial.video_url}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...testimonial, type: 'testimonial' }); 
                              testimonialForm.reset(testimonial); 
                              setSelectedVideoFile(null);
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteTestimonial(testimonial.id, testimonial.video_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Quotes Tab */}
              <TabsContent value="quotes" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'quote'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); quoteForm.reset(); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'quote' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Quote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Quote</DialogTitle>
                      <DialogDescription>Fill in the quote details below</DialogDescription>
                    </DialogHeader>
                    <Form {...quoteForm}>
                      <form onSubmit={quoteForm.handleSubmit(onQuoteSubmit)} className="space-y-4">
                        <FormField control={quoteForm.control} name="text" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quote Text</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={quoteForm.control} name="author" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author (optional)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Quote"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {quotes.map(quote => (
                    <Card key={quote.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="italic">"{quote.text}"</p>
                            {quote.author && <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingItem({ ...quote, type: 'quote' }); quoteForm.reset(quote); setDialogOpen(true); }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteQuote(quote.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'faq'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); faqForm.reset(); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'faq' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} FAQ</DialogTitle>
                      <DialogDescription>Fill in the FAQ details below</DialogDescription>
                    </DialogHeader>
                    <Form {...faqForm}>
                      <form onSubmit={faqForm.handleSubmit(onFAQSubmit)} className="space-y-4">
                        <FormField control={faqForm.control} name="question" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={faqForm.control} name="answer" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl><Textarea rows={6} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={faqForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save FAQ"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {faqs.map(faq => (
                    <Card key={faq.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{faq.question}</h3>
                            <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                            <p className="text-xs text-muted-foreground mt-2">Order: {faq.display_order}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...faq, type: 'faq' }); 
                              faqForm.reset(faq); 
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteFAQ(faq.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Volunteers Tab */}
              <TabsContent value="volunteers" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'volunteer'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); volunteerForm.reset(); setSelectedVolunteerImageFile(null); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'volunteer' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Volunteer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Volunteer</DialogTitle>
                      <DialogDescription>Fill in the volunteer details below. Max image size: 5MB</DialogDescription>
                    </DialogHeader>
                    <Form {...volunteerForm}>
                      <form onSubmit={volunteerForm.handleSubmit(onVolunteerSubmit)} className="space-y-4">
                        <FormField control={volunteerForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={volunteerForm.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={volunteerForm.control} name="quote" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quote</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        {/* Image Upload Section */}
                        <div className="space-y-3">
                          <Label>Volunteer Image</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="volunteer-image-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedVolunteerImageFile(file);
                              }}
                            />
                            <label htmlFor="volunteer-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="text-muted-foreground" size={24} />
                              <span className="text-sm text-muted-foreground">
                                {selectedVolunteerImageFile ? selectedVolunteerImageFile.name : "Click to upload image (max 5MB)"}
                              </span>
                            </label>
                            {selectedVolunteerImageFile && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => setSelectedVolunteerImageFile(null)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground text-center">Or provide an image URL below</p>
                        </div>

                        <FormField control={volunteerForm.control} name="image_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (optional if uploading)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="https://..."
                                disabled={!!selectedVolunteerImageFile}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={volunteerForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading || uploadingVolunteerImage} className="w-full">
                          {uploadingVolunteerImage ? "Uploading image..." : isLoading ? "Saving..." : "Save Volunteer"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {volunteers.map(volunteer => (
                    <Card key={volunteer.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{volunteer.name}</h3>
                            <p className="text-sm text-muted-foreground">{volunteer.role}</p>
                            <p className="mt-2 italic">"{volunteer.quote}"</p>
                            <p className="text-xs text-muted-foreground mt-2">Order: {volunteer.display_order}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...volunteer, type: 'volunteer' }); 
                              volunteerForm.reset(volunteer); 
                              setSelectedVolunteerImageFile(null);
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteVolunteer(volunteer.id, volunteer.image_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <Card className="shadow-soft border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="text-primary" size={24} />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Update the contact details displayed on the website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                        <FormField control={contactForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={contactForm.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={contactForm.control} name="address" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={contactForm.control} name="instagram_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={contactForm.control} name="linkedin_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading} className="shadow-soft">
                          <Save className="mr-2" size={18} />
                          {isLoading ? "Saving..." : "Save Contact Information"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'post'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); postForm.reset(); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'post' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit Post' : 'Add New Post'}</DialogTitle>
                      <DialogDescription>Create updates, notifications, or alerts for users</DialogDescription>
                    </DialogHeader>
                    <Form {...postForm}>
                      <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                        <FormField control={postForm.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={postForm.control} name="content" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl><Textarea {...field} rows={8} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={postForm.control} name="type" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2">
                                <option value="news">News</option>
                                <option value="notification">Notification</option>
                                <option value="alert">Alert</option>
                                <option value="event_cancellation">Event Cancellation</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : editingItem?.id ? "Update Post" : "Create Post"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="text-primary" size={24} />
                      All Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="flex items-start justify-between border-b pb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{post.content.substring(0, 100)}...</p>
                            <p className="text-xs text-muted-foreground mt-2">Type: {post.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingItem({ ...post, type: 'post' });
                              postForm.reset(post);
                              setDialogOpen(true);
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {posts.length === 0 && <p className="text-muted-foreground">No posts yet</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'gallery'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); galleryForm.reset(); } }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => { setEditingItem({ type: 'gallery' }); setDialogOpen(true); }} 
                      className="mb-4"
                      disabled={galleryImages.length >= 25}
                    >
                      <Plus className="mr-2" size={18} />
                      Add Image ({galleryImages.length}/25)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit Gallery Image' : 'Add New Image'}</DialogTitle>
                      <DialogDescription>Upload memories to the Memory Lane gallery (max 25 images)</DialogDescription>
                    </DialogHeader>
                    <Form {...galleryForm}>
                      <form onSubmit={galleryForm.handleSubmit(onGallerySubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Upload Image</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            disabled={uploadingImage}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file);
                                if (url) {
                                  galleryForm.setValue('image_url', url);
                                }
                              }
                            }}
                          />
                          {uploadingImage && <p className="text-sm text-muted-foreground">Uploading...</p>}
                        </div>
                        <FormField control={galleryForm.control} name="image_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input {...field} placeholder="Auto-filled after upload" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={galleryForm.control} name="caption" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caption (Optional)</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={galleryForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading || uploadingImage}>
                          {isLoading ? "Saving..." : editingItem?.id ? "Update Image" : "Add Image"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="text-primary" size={24} />
                      Gallery Images ({galleryImages.length}/25)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img src={image.image_url} alt={image.caption || ''} className="w-full h-40 object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingItem({ ...image, type: 'gallery' });
                              galleryForm.reset(image);
                              setDialogOpen(true);
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteGalleryImage(image.id, image.image_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          {image.caption && <p className="text-xs mt-1 truncate">{image.caption}</p>}
                        </div>
                      ))}
                      {galleryImages.length === 0 && <p className="text-muted-foreground col-span-full">No images yet</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
