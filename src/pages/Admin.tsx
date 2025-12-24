import { useState, useEffect } from "react";
import { Lock, Calendar, MessageSquare, Quote, Save, Plus, Edit, Trash2, HelpCircle, Phone, Image as ImageIcon, Upload, Video, Heart, Layers, Users, Briefcase, Download, FileText, CalendarIcon } from "lucide-react";
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
  map_link: z.string().max(500).trim().optional(),
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

const contactSchema = z.object({
  email: z.string().email().max(255).trim().optional().or(z.literal('')),
  phone: z.string().max(50).trim().optional(),
  address: z.string().max(500).trim().optional(),
  instagram_url: z.string().max(500).trim().optional(),
  linkedin_url: z.string().max(500).trim().optional(),
});

const gallerySchema = z.object({
  image_url: z.string().url().max(500).trim(),
  caption: z.string().max(500).trim().optional(),
  display_order: z.number().int().min(0).default(0),
});

const founderSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  role: z.string().max(100).trim().optional(),
  bio: z.string().min(1).max(1000).trim(),
  work: z.string().max(500).trim().optional(),
  motto: z.string().max(500).trim().optional(),
  image_url: z.string().max(500).trim().optional(),
  linkedin_url: z.string().max(500).trim().optional(),
  instagram_url: z.string().max(500).trim().optional(),
  twitter_url: z.string().max(500).trim().optional(),
  display_order: z.number().int().min(0).default(0),
});

const serviceSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(1000).trim(),
  banner_image_url: z.string().max(500).trim().optional(),
  whatsapp_message: z.string().max(500).trim().optional(),
  display_order: z.number().int().min(0).default(0),
});

const bannerSlideSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  subtitle: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(500).trim(),
  image_url: z.string().max(500).trim().optional(),
  cta_text: z.string().min(1).max(100).trim(),
  cta_link: z.string().min(1).max(200).trim(),
  icon_type: z.string().min(1).max(50).trim(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;
type EventFormValues = z.infer<typeof eventSchema>;
type TestimonialFormValues = z.infer<typeof testimonialSchema>;
type QuoteFormValues = z.infer<typeof quoteSchema>;
type FAQFormValues = z.infer<typeof faqSchema>;
type ContactFormValues = z.infer<typeof contactSchema>;
type GalleryFormValues = z.infer<typeof gallerySchema>;
type FounderFormValues = z.infer<typeof founderSchema>;
type ServiceFormValues = z.infer<typeof serviceSchema>;
type BannerSlideFormValues = z.infer<typeof bannerSlideSchema>;

const Admin = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [founders, setFounders] = useState<any[]>([]);
  const [foundersFooterText, setFoundersFooterText] = useState<string>("");
  const [services, setServices] = useState<any[]>([]);
  const [bannerSlides, setBannerSlides] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFounderImage, setUploadingFounderImage] = useState(false);
  const [uploadingServiceImage, setUploadingServiceImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedFounderImageFile, setSelectedFounderImageFile] = useState<File | null>(null);
  const [selectedServiceImageFile, setSelectedServiceImageFile] = useState<File | null>(null);
  const [selectedBannerImageFile, setSelectedBannerImageFile] = useState<File | null>(null);
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");
  
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
      map_link: "",
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

  const galleryForm = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      image_url: "",
      caption: "",
      display_order: 0,
    },
  });

  const founderForm = useForm<FounderFormValues>({
    resolver: zodResolver(founderSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      work: "",
      motto: "",
      image_url: "",
      linkedin_url: "",
      instagram_url: "",
      twitter_url: "",
      display_order: 0,
    },
  });

  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      banner_image_url: "",
      whatsapp_message: "",
      display_order: 0,
    },
  });

  const bannerSlideForm = useForm<BannerSlideFormValues>({
    resolver: zodResolver(bannerSlideSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      cta_text: "Learn More",
      cta_link: "/services",
      icon_type: "heart",
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchWhatsAppContact();
    fetchEvents();
    fetchTestimonials();
    fetchQuotes();
    fetchFAQs();
    fetchContactInfo();
    fetchGalleryImages();
    fetchFounders();
    fetchFoundersFooterText();
    fetchServices();
    fetchBannerSlides();
    fetchContactSubmissions();
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

  const fetchContactInfo = async () => {
    const { data } = await supabase.from("contact_info").select("*").maybeSingle();
    if (data) {
      setContactInfo(data);
      contactForm.reset(data);
    }
  };

  const fetchGalleryImages = async () => {
    const { data } = await supabase.from("gallery_images").select("*").order("display_order", { ascending: true });
    if (data) setGalleryImages(data);
  };

  const fetchFounders = async () => {
    const { data } = await supabase.from("founders").select("*").order("display_order", { ascending: true });
    if (data) setFounders(data);
  };

  const fetchFoundersFooterText = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "founders_footer_text")
      .maybeSingle();
    if (data) setFoundersFooterText(data.value);
  };

  const saveFoundersFooterText = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("settings").upsert({
        key: "founders_footer_text",
        value: foundersFooterText.trim(),
      }, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Success", description: "Founders footer text updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("display_order", { ascending: true });
    if (data) setServices(data);
  };

  const fetchBannerSlides = async () => {
    const { data } = await supabase.from("banner_slides").select("*").order("display_order", { ascending: true });
    if (data) setBannerSlides(data);
  };

  const fetchContactSubmissions = async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (data) setContactSubmissions(data);
  };

  const getFilteredSubmissions = () => {
    return contactSubmissions.filter((submission) => {
      const submissionDate = new Date(submission.created_at);
      if (exportStartDate) {
        const startDate = new Date(exportStartDate);
        startDate.setHours(0, 0, 0, 0);
        if (submissionDate < startDate) return false;
      }
      if (exportEndDate) {
        const endDate = new Date(exportEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (submissionDate > endDate) return false;
      }
      return true;
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredSubmissions();
    if (filtered.length === 0) {
      toast({ title: "No Data", description: "No submissions to export for the selected date range", variant: "destructive" });
      return;
    }

    const headers = ["Name", "Age", "Profession", "City", "Submitted At"];
    const csvRows = [headers.join(",")];

    filtered.forEach((submission) => {
      const row = [
        `"${(submission.name || "").replace(/"/g, '""')}"`,
        submission.age || "",
        `"${(submission.profession || "").replace(/"/g, '""')}"`,
        `"${(submission.city || "").replace(/"/g, '""')}"`,
        new Date(submission.created_at).toLocaleString(),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const dateRange = exportStartDate || exportEndDate 
      ? `_${exportStartDate || 'start'}_to_${exportEndDate || 'end'}` 
      : "";
    link.setAttribute("download", `contact_submissions${dateRange}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: `Exported ${filtered.length} submissions to CSV` });
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
        map_link: values.map_link || null,
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
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Video file must be less than 10MB", variant: "destructive" });
      return null;
    }

    setUploadingVideo(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage
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
      if (!editingItem?.id && testimonials.length >= 12) {
        toast({ title: "Error", description: "Maximum of 12 testimonials allowed", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      let videoUrl = values.video_url || "";
      
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

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage
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

  const onGallerySubmit = async (data: GalleryFormValues) => {
    setIsLoading(true);
    
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

  // Founder image upload
  const uploadFounderImage = async (file: File): Promise<string | null> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Image file must be less than 5MB", variant: "destructive" });
      return null;
    }

    setUploadingFounderImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('founder-images')
      .upload(fileName, file);

    setUploadingFounderImage(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('founder-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const onFounderSubmit = async (values: FounderFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = values.image_url || "";
      
      if (selectedFounderImageFile) {
        const uploadedUrl = await uploadFounderImage(selectedFounderImageFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (!imageUrl) {
        toast({ title: "Error", description: "Please provide an image URL or upload an image", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const founderData = {
        name: values.name,
        role: values.role || null,
        bio: values.bio,
        work: values.work || null,
        motto: values.motto || null,
        image_url: imageUrl,
        linkedin_url: values.linkedin_url || null,
        instagram_url: values.instagram_url || null,
        twitter_url: values.twitter_url || null,
        display_order: values.display_order,
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("founders").update(founderData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Founder updated successfully" });
      } else {
        const { error } = await supabase.from("founders").insert([{ ...founderData, is_active: true }]);
        if (error) throw error;
        toast({ title: "Success", description: "Founder created successfully" });
      }
      fetchFounders();
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedFounderImageFile(null);
      founderForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Service image upload
  const uploadServiceImage = async (file: File): Promise<string | null> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Image file must be less than 5MB", variant: "destructive" });
      return null;
    }

    setUploadingServiceImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file);

    setUploadingServiceImage(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const onServiceSubmit = async (values: ServiceFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = values.banner_image_url || "";
      
      if (selectedServiceImageFile) {
        const uploadedUrl = await uploadServiceImage(selectedServiceImageFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const serviceData = {
        name: values.name,
        description: values.description,
        banner_image_url: imageUrl || null,
        whatsapp_message: values.whatsapp_message || null,
        display_order: values.display_order,
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("services").update(serviceData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Service updated successfully" });
      } else {
        const { error } = await supabase.from("services").insert([{ ...serviceData, is_active: true }]);
        if (error) throw error;
        toast({ title: "Success", description: "Service created successfully" });
      }
      fetchServices();
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedServiceImageFile(null);
      serviceForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Banner image upload
  const uploadBannerImage = async (file: File): Promise<string | null> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Image file must be less than 5MB", variant: "destructive" });
      return null;
    }

    setUploadingBannerImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('banner-images')
      .upload(fileName, file);

    setUploadingBannerImage(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('banner-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const onBannerSlideSubmit = async (values: BannerSlideFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = values.image_url || "";
      
      if (selectedBannerImageFile) {
        const uploadedUrl = await uploadBannerImage(selectedBannerImageFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const bannerData = {
        title: values.title,
        subtitle: values.subtitle,
        description: values.description,
        image_url: imageUrl || null,
        cta_text: values.cta_text,
        cta_link: values.cta_link,
        icon_type: values.icon_type,
        display_order: values.display_order,
        is_active: values.is_active,
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("banner_slides").update(bannerData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Success", description: "Banner slide updated successfully" });
      } else {
        const { error } = await supabase.from("banner_slides").insert([{ ...bannerData, is_active: true }]);
        if (error) throw error;
        toast({ title: "Success", description: "Banner slide created successfully" });
      }
      fetchBannerSlides();
      setDialogOpen(false);
      setEditingItem(null);
      setSelectedBannerImageFile(null);
      bannerSlideForm.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete functions
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

  const deleteGalleryImage = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", id);
    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
      return;
    }

    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('memory-lane').remove([fileName]);
    }

    toast({ title: "Success", description: "Image deleted successfully" });
    fetchGalleryImages();
  };

  const deleteFounder = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this founder?")) return;
    const { error } = await supabase.from("founders").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (imageUrl && imageUrl.includes('founder-images')) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('founder-images').remove([fileName]);
        }
      }
      toast({ title: "Success", description: "Founder deleted successfully" });
      fetchFounders();
    }
  };

  const deleteService = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (imageUrl && imageUrl.includes('service-images')) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('service-images').remove([fileName]);
        }
      }
      toast({ title: "Success", description: "Service deleted successfully" });
      fetchServices();
    }
  };

  const deleteBannerSlide = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this banner slide?")) return;
    const { error } = await supabase.from("banner_slides").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (imageUrl && imageUrl.includes('banner-images')) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('banner-images').remove([fileName]);
        }
      }
      toast({ title: "Success", description: "Banner slide deleted successfully" });
      fetchBannerSlides();
    }
  };

  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("banner_slides").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Banner ${!currentStatus ? 'activated' : 'deactivated'}` });
      fetchBannerSlides();
    }
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
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="founders">Founders</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="banners">Banners</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
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
                        <FormField control={eventForm.control} name="map_link" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Map/Directions Link (optional)</FormLabel>
                            <FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl>
                            <FormDescription>Google Maps or directions link</FormDescription>
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
                          <div>
                            <h3 className="font-bold text-lg">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                            <p className="text-sm">{event.location}</p>
                            {event.map_link && <p className="text-xs text-primary mt-1">Has map link</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...event, type: 'event' }); 
                              eventForm.reset(event); 
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
                <div className="flex items-center gap-4 mb-4">
                  <Dialog open={dialogOpen && editingItem?.type === 'testimonial'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); testimonialForm.reset(); setSelectedVideoFile(null); } }}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => { setEditingItem({ type: 'testimonial' }); setDialogOpen(true); }}
                        disabled={testimonials.length >= 12}
                      >
                        <Plus className="mr-2" size={18} />
                        Add Testimonial ({testimonials.length}/12)
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Testimonial</DialogTitle>
                        <DialogDescription>Add a video testimonial (max 10MB for uploads)</DialogDescription>
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
                                <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedVideoFile(null)}>
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
                                <Input {...field} placeholder="https://youtube.com/watch?v=..." disabled={!!selectedVideoFile} />
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

              {/* Contact Tab */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="text-primary" size={24} />
                      Contact Information
                    </CardTitle>
                    <CardDescription>Update your organization's contact details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                        <FormField control={contactForm.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
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
                        <FormField control={contactForm.control} name="instagram_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
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

              {/* Founders Tab */}
              <TabsContent value="founders" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'founder'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); founderForm.reset(); setSelectedFounderImageFile(null); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'founder' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Founder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Founder</DialogTitle>
                      <DialogDescription>Fill in the founder details including social media links</DialogDescription>
                    </DialogHeader>
                    <Form {...founderForm}>
                      <form onSubmit={founderForm.handleSubmit(onFounderSubmit)} className="space-y-4">
                        <FormField control={founderForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={founderForm.control} name="role" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role/Title</FormLabel>
                            <FormControl><Input placeholder="Co-Founder, CEO, etc." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={founderForm.control} name="work" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work/Profession</FormLabel>
                            <FormControl><Input placeholder="Mental Health Advocate, Therapist, etc." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={founderForm.control} name="motto" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motto/Tagline</FormLabel>
                            <FormControl><Input placeholder="Their personal motto or tagline" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={founderForm.control} name="bio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio/Description</FormLabel>
                            <FormControl><Textarea rows={4} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Image Upload */}
                        <div className="space-y-3">
                          <Label>Founder Image</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="founder-image-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedFounderImageFile(file);
                              }}
                            />
                            <label htmlFor="founder-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="text-muted-foreground" size={24} />
                              <span className="text-sm text-muted-foreground">
                                {selectedFounderImageFile ? selectedFounderImageFile.name : "Click to upload image (max 5MB)"}
                              </span>
                            </label>
                            {selectedFounderImageFile && (
                              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedFounderImageFile(null)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        <FormField control={founderForm.control} name="image_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (optional if uploading)</FormLabel>
                            <FormControl><Input {...field} disabled={!!selectedFounderImageFile} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Social Media Links */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Social Media Links</h4>
                          <div className="grid gap-4">
                            <FormField control={founderForm.control} name="linkedin_url" render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL</FormLabel>
                                <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={founderForm.control} name="instagram_url" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={founderForm.control} name="twitter_url" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter/X URL</FormLabel>
                                <FormControl><Input placeholder="https://twitter.com/..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <FormField control={founderForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <Button type="submit" disabled={isLoading || uploadingFounderImage} className="w-full">
                          {uploadingFounderImage ? "Uploading..." : isLoading ? "Saving..." : "Save Founder"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {founders.map(founder => (
                    <Card key={founder.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-start">
                            {founder.image_url && (
                              <img src={founder.image_url} alt={founder.name} className="w-16 h-16 rounded-full object-cover" />
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{founder.name}</h3>
                              {founder.role && <p className="text-sm text-primary">{founder.role}</p>}
                              {founder.work && <p className="text-sm text-muted-foreground">{founder.work}</p>}
                              {founder.motto && <p className="text-sm italic mt-1">"{founder.motto}"</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...founder, type: 'founder' }); 
                              founderForm.reset(founder); 
                              setSelectedFounderImageFile(null);
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteFounder(founder.id, founder.image_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {founders.length === 0 && <p className="text-muted-foreground">No founders added yet</p>}
                </div>

                {/* Founders Footer Text */}
                <Card className="shadow-soft border-border mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Founders Page Footer Text</CardTitle>
                    <CardDescription>
                      This 2-line text block appears below the founders section on the Founders page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Enter 2-line text to display below founders (e.g., mission statement, vision, etc.)"
                        rows={3}
                        value={foundersFooterText}
                        onChange={(e) => setFoundersFooterText(e.target.value)}
                        className="resize-none"
                      />
                      <Button onClick={saveFoundersFooterText} disabled={isLoading} className="shadow-soft">
                        <Save className="mr-2" size={18} />
                        {isLoading ? "Saving..." : "Save Footer Text"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'service'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); serviceForm.reset(); setSelectedServiceImageFile(null); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'service' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Service</DialogTitle>
                      <DialogDescription>Fill in the service details</DialogDescription>
                    </DialogHeader>
                    <Form {...serviceForm}>
                      <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                        <FormField control={serviceForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={serviceForm.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea rows={4} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Banner Image Upload */}
                        <div className="space-y-3">
                          <Label>Banner Image</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="service-image-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedServiceImageFile(file);
                              }}
                            />
                            <label htmlFor="service-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="text-muted-foreground" size={24} />
                              <span className="text-sm text-muted-foreground">
                                {selectedServiceImageFile ? selectedServiceImageFile.name : "Click to upload banner image (max 5MB)"}
                              </span>
                            </label>
                            {selectedServiceImageFile && (
                              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedServiceImageFile(null)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        <FormField control={serviceForm.control} name="banner_image_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner Image URL (optional if uploading)</FormLabel>
                            <FormControl><Input {...field} disabled={!!selectedServiceImageFile} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={serviceForm.control} name="whatsapp_message" render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Pre-filled Message</FormLabel>
                            <FormControl><Textarea placeholder="Hi, I'm interested in..." {...field} /></FormControl>
                            <FormDescription>This message will be pre-filled when users click "Connect via WhatsApp"</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={serviceForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <Button type="submit" disabled={isLoading || uploadingServiceImage} className="w-full">
                          {uploadingServiceImage ? "Uploading..." : isLoading ? "Saving..." : "Save Service"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {services.map(service => (
                    <Card key={service.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-start">
                            {service.banner_image_url && (
                              <img src={service.banner_image_url} alt={service.name} className="w-24 h-16 rounded object-cover" />
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{service.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">Order: {service.display_order}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...service, type: 'service' }); 
                              serviceForm.reset(service); 
                              setSelectedServiceImageFile(null);
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteService(service.id, service.banner_image_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {services.length === 0 && <p className="text-muted-foreground">No services added yet</p>}
                </div>
              </TabsContent>

              {/* Banners Tab */}
              <TabsContent value="banners" className="space-y-4">
                <Dialog open={dialogOpen && editingItem?.type === 'banner'} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingItem(null); bannerSlideForm.reset(); setSelectedBannerImageFile(null); } }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem({ type: 'banner' }); setDialogOpen(true); }} className="mb-4">
                      <Plus className="mr-2" size={18} />
                      Add Banner Slide
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem?.id ? 'Edit' : 'Add'} Banner Slide</DialogTitle>
                      <DialogDescription>Configure the hero banner slide</DialogDescription>
                    </DialogHeader>
                    <Form {...bannerSlideForm}>
                      <form onSubmit={bannerSlideForm.handleSubmit(onBannerSlideSubmit)} className="space-y-4">
                        <FormField control={bannerSlideForm.control} name="title" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={bannerSlideForm.control} name="subtitle" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={bannerSlideForm.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea rows={3} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Banner Image Upload */}
                        <div className="space-y-3">
                          <Label>Background Image</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="banner-image-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setSelectedBannerImageFile(file);
                              }}
                            />
                            <label htmlFor="banner-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                              <Upload className="text-muted-foreground" size={24} />
                              <span className="text-sm text-muted-foreground">
                                {selectedBannerImageFile ? selectedBannerImageFile.name : "Click to upload background image (max 5MB)"}
                              </span>
                            </label>
                            {selectedBannerImageFile && (
                              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedBannerImageFile(null)}>
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        <FormField control={bannerSlideForm.control} name="image_url" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (optional if uploading)</FormLabel>
                            <FormControl><Input {...field} disabled={!!selectedBannerImageFile} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={bannerSlideForm.control} name="cta_text" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Text</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={bannerSlideForm.control} name="cta_link" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Link</FormLabel>
                              <FormControl><Input placeholder="/services" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={bannerSlideForm.control} name="icon_type" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Type</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2">
                                <option value="heart">Heart</option>
                                <option value="users">Users</option>
                                <option value="calendar">Calendar</option>
                                <option value="star">Star</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bannerSlideForm.control} name="display_order" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            <FormDescription>Lower numbers appear first</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={bannerSlideForm.control} name="is_active" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>Show this banner on the home page</FormDescription>
                            </div>
                          </FormItem>
                        )} />

                        <Button type="submit" disabled={isLoading || uploadingBannerImage} className="w-full">
                          {uploadingBannerImage ? "Uploading..." : isLoading ? "Saving..." : "Save Banner Slide"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="grid gap-4">
                  {bannerSlides.map(slide => (
                    <Card key={slide.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 items-start">
                            {slide.image_url && (
                              <img src={slide.image_url} alt={slide.title} className="w-32 h-20 rounded object-cover" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{slide.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {slide.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-primary">{slide.subtitle}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{slide.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">CTA: {slide.cta_text} → {slide.cta_link}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Button 
                              size="sm" 
                              variant={slide.is_active ? "secondary" : "default"}
                              onClick={() => toggleBannerActive(slide.id, slide.is_active)}
                            >
                              {slide.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { 
                              setEditingItem({ ...slide, type: 'banner' }); 
                              bannerSlideForm.reset(slide); 
                              setSelectedBannerImageFile(null);
                              setDialogOpen(true); 
                            }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteBannerSlide(slide.id, slide.image_url)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {bannerSlides.length === 0 && <p className="text-muted-foreground">No banner slides added yet</p>}
                </div>
              </TabsContent>

              {/* Submissions Tab */}
              <TabsContent value="submissions" className="space-y-4">
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText size={20} />
                      Contact Form Submissions ({contactSubmissions.length})
                    </h3>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon size={14} />
                        From Date
                      </Label>
                      <Input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-[160px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon size={14} />
                        To Date
                      </Label>
                      <Input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-[160px]"
                      />
                    </div>
                    {(exportStartDate || exportEndDate) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => { setExportStartDate(""); setExportEndDate(""); }}
                      >
                        Clear Dates
                      </Button>
                    )}
                    <div className="ml-auto">
                      <Button onClick={exportToCSV} disabled={getFilteredSubmissions().length === 0}>
                        <Download className="mr-2" size={18} />
                        Export CSV ({getFilteredSubmissions().length})
                      </Button>
                    </div>
                  </div>
                </div>

                {contactSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-semibold">Name</th>
                          <th className="text-left p-3 font-semibold">Age</th>
                          <th className="text-left p-3 font-semibold">Profession</th>
                          <th className="text-left p-3 font-semibold">City</th>
                          <th className="text-left p-3 font-semibold">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-3">{submission.name}</td>
                            <td className="p-3">{submission.age}</td>
                            <td className="p-3">{submission.profession}</td>
                            <td className="p-3">{submission.city}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {new Date(submission.created_at).toLocaleDateString()} {new Date(submission.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No submissions yet</p>
                )}
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