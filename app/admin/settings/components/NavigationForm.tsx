'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Navigation,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigation, useSettings } from '@/contexts/SettingsContext';
import { NavigationItem } from '@/types/settings';
import { toast } from 'sonner';

export function NavigationForm() {
  const { navigation } = useNavigation();
  const { refresh } = useSettings();
  const [isPending, startTransition] = useTransition();
  const [headerItems, setHeaderItems] = useState(navigation.headerItems);
  const [footerLinks, setFooterLinks] = useState(navigation.footerQuickLinks);
  const [showSignIn, setShowSignIn] = useState(navigation.showSignIn);
  const [signInLabel, setSignInLabel] = useState(navigation.signInLabel);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            navigation: {
              headerItems,
              footerQuickLinks: footerLinks,
              showSignIn,
              signInLabel,
            },
          }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string; details?: unknown };
        if (res.status === 401) {
          toast.error('Your admin session has expired — sign in again.');
          return;
        }
        if (json.ok) {
          toast.success('Navigation settings saved');
          await refresh();
        } else {
          toast.error(json.error ?? 'Failed to save settings');
        }
      } catch {
        toast.error('Failed to save settings');
      }
    });
  };

  const toggleHeaderItem = (id: string) => {
    setHeaderItems(
      headerItems.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const toggleFooterItem = (id: string) => {
    setFooterLinks(
      footerLinks.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const updateHeaderItem = (id: string, field: keyof NavigationItem, value: string) => {
    setHeaderItems(
      headerItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const updateFooterItem = (id: string, field: keyof NavigationItem, value: string) => {
    setFooterLinks(
      footerLinks.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addHeaderItem = () => {
    const newItem: NavigationItem = {
      id: String(Date.now()),
      name: 'New Link',
      href: '/',
      enabled: true,
      order: headerItems.length + 1,
      showInHeader: true,
      showInFooter: false,
    };
    setHeaderItems([...headerItems, newItem]);
  };

  const addFooterItem = () => {
    const newItem: NavigationItem = {
      id: String(Date.now()),
      name: 'New Link',
      href: '/',
      enabled: true,
      order: footerLinks.length + 1,
      showInHeader: false,
      showInFooter: true,
    };
    setFooterLinks([...footerLinks, newItem]);
  };

  const removeHeaderItem = (id: string) => {
    setHeaderItems(headerItems.filter((item) => item.id !== id));
  };

  const removeFooterItem = (id: string) => {
    setFooterLinks(footerLinks.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Header Navigation
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addHeaderItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {headerItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleHeaderItem(item.id)}
              />
              <div className="flex-1 grid gap-2 md:grid-cols-2">
                <Input
                  value={item.name}
                  onChange={(e) => updateHeaderItem(item.id, 'name', e.target.value)}
                  placeholder="Link name"
                />
                <Input
                  value={item.href}
                  onChange={(e) => updateHeaderItem(item.id, 'href', e.target.value)}
                  placeholder="/path"
                />
              </div>
              {!item.enabled && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeHeaderItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {headerItems.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No header navigation items. Add one above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sign In Button */}
      <Card>
        <CardHeader>
          <CardTitle>Sign In Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSignIn"
              checked={showSignIn}
              onCheckedChange={(checked) => setShowSignIn(checked as boolean)}
            />
            <Label htmlFor="showSignIn" className="font-normal">
              Show sign in button in header
            </Label>
          </div>
          {showSignIn && (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="signInLabel">Button Label</Label>
              <Input
                id="signInLabel"
                value={signInLabel}
                onChange={(e) => setSignInLabel(e.target.value)}
                placeholder="Sign In"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Footer Quick Links
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addFooterItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerLinks.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleFooterItem(item.id)}
              />
              <div className="flex-1 grid gap-2 md:grid-cols-2">
                <Input
                  value={item.name}
                  onChange={(e) => updateFooterItem(item.id, 'name', e.target.value)}
                  placeholder="Link name"
                />
                <Input
                  value={item.href}
                  onChange={(e) => updateFooterItem(item.id, 'href', e.target.value)}
                  placeholder="/path"
                />
              </div>
              {!item.enabled && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeFooterItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {footerLinks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No footer links. Add one above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Navigation
        </Button>
      </div>
    </div>
  );
}
