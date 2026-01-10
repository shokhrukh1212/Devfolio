"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Copy, Check, Globe, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Profile } from "@/types";

const profileFormSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500).optional(),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  twitter_url: z.string().url().optional().or(z.literal("")),
  telegram_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsContentProps {
  profile: Profile | null;
}

export function SettingsContent({ profile }: SettingsContentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainWaitlistJoined, setDomainWaitlistJoined] = useState(
    profile?.custom_data?.waitlist_interests?.custom_domain || false
  );
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("toast");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repospace.vercel.app";
  const portfolioUrl = `${appUrl}/portfolio/${profile?.username}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success(tToast("urlCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(tToast("copyFailed"));
    }
  };

  const handleConnectDomain = () => {
    if (!customDomain.trim()) return;
    setShowDomainModal(true);
  };

  const handleJoinDomainWaitlist = async () => {
    if (!profile?.id) return;
    setIsJoiningWaitlist(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: "custom_domain",
          userId: profile.id,
          metadata: { requested_domain: customDomain },
        }),
      });

      if (response.ok) {
        setDomainWaitlistJoined(true);
        setCustomDomain(""); // Clear input after joining
      }
    } catch (error) {
      console.error("Failed to join waitlist:", error);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const handleCloseDomainModal = (open: boolean) => {
    setShowDomainModal(open);
    if (!open) {
      setCustomDomain(""); // Clear input when modal closes
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      email: profile?.email || "",
      location: profile?.location || "",
      github_url: profile?.github_url || "",
      linkedin_url: profile?.linkedin_url || "",
      website_url: profile?.website_url || "",
      twitter_url: profile?.twitter_url || "",
      telegram_url: profile?.telegram_url || "",
      is_published: profile?.is_published || false,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          bio: data.bio || null,
          email: data.email || null,
          location: data.location || null,
          github_url: data.github_url || null,
          linkedin_url: data.linkedin_url || null,
          website_url: data.website_url || null,
          twitter_url: data.twitter_url || null,
          telegram_url: data.telegram_url || null,
          is_published: data.is_published,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast.success(tToast("profileUpdated"));
      // Refresh to update sidebar with new is_published state
      router.refresh();
    } catch (error) {
      toast.error(tToast("profileUpdateFailed"));
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Publish Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>{t("portfolioStatus.title")}</CardTitle>
              <CardDescription>
                {t("portfolioStatus.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("portfolioStatus.publishLabel")}
                      </FormLabel>
                      <FormDescription className="flex items-center gap-2 flex-wrap">
                        <span>{t("portfolioStatus.publishDescription")}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            /portfolio/{profile?.username}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUrl}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title={t("copyUrl")}
                          >
                            {copied ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        </span>
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("basicInfo.title")}</CardTitle>
              <CardDescription>{t("basicInfo.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basicInfo.displayName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("basicInfo.displayNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("basicInfo.bio")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("basicInfo.bioPlaceholder")}
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("basicInfo.bioDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("basicInfo.location")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("basicInfo.locationPlaceholder")}
                          {...field}
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
                      <FormLabel>{t("basicInfo.email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("basicInfo.emailPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>{t("socialLinks.title")}</CardTitle>
              <CardDescription>{t("socialLinks.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="github_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("socialLinks.github")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("socialLinks.githubPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("socialLinks.linkedin")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("socialLinks.linkedinPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("socialLinks.website")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("socialLinks.websitePlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("socialLinks.twitter")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("socialLinks.twitterPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isUpdating}>
              {/* {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
              {isUpdating ? <>{tCommon("saving")}</> : tCommon("save")}
            </Button>
          </div>
        </form>
      </Form>

      {/* Custom Domain Section (outside the form) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("customDomain.title")}
          </CardTitle>
          <CardDescription>{t("customDomain.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={t("customDomain.placeholder")}
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleConnectDomain}
              disabled={!customDomain.trim()}
            >
              {t("customDomain.connect")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain Coming Soon Modal */}
      <Dialog open={showDomainModal} onOpenChange={handleCloseDomainModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-2xl mb-2">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>{t("customDomain.comingSoon.title")}</DialogTitle>
            <DialogDescription className="pt-2">
              {t("customDomain.comingSoon.description")}
            </DialogDescription>
          </DialogHeader>

          {domainWaitlistJoined ? (
            <div className="flex items-center justify-center gap-2 py-4 text-primary font-medium">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              {t("customDomain.comingSoon.success")}
            </div>
          ) : (
            <DialogFooter className="sm:justify-center pt-4">
              <Button
                onClick={handleJoinDomainWaitlist}
                disabled={isJoiningWaitlist}
                className="w-full sm:w-auto"
              >
                {isJoiningWaitlist && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("customDomain.comingSoon.notify")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
