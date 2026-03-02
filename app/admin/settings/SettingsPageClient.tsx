'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandingForm } from './components/BrandingForm';
import { ContactForm } from './components/ContactForm';
import { ContentForm } from './components/ContentForm';
import { NavigationForm } from './components/NavigationForm';

export function SettingsPageClient() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your website branding, content, and navigation
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingForm />
        </TabsContent>

        <TabsContent value="contact">
          <ContactForm />
        </TabsContent>

        <TabsContent value="content">
          <ContentForm />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
