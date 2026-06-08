import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCreateMerchant() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success(t('common.action_success')); navigate('/admin/merchants'); }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.create_merchant')} action={<Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/merchants')}><ArrowLeft className="h-4 w-4" />{t('common.back')}</Button>} />
      <Card className="border-0 shadow-sm max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('auth.business_name')}</Label><Input className="mt-1" required /></div>
              <div><Label>{t('auth.owner_name')}</Label><Input className="mt-1" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('auth.email')}</Label><Input type="email" className="mt-1" required /></div>
              <div><Label>{t('auth.phone')}</Label><Input className="mt-1" /></div>
            </div>
            <div>
              <Label>{t('auth.business_type')}</Label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">{t('auth.type_restaurant')}</SelectItem>
                  <SelectItem value="cafe">{t('auth.type_cafe')}</SelectItem>
                  <SelectItem value="salon">{t('auth.type_salon')}</SelectItem>
                  <SelectItem value="boutique">{t('auth.type_boutique')}</SelectItem>
                  <SelectItem value="autre">{t('auth.type_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('admin.subscription')}</Label>
              <Select defaultValue="free"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="pro">Pro</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>{t('auth.logo')}</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition"><Upload className="h-4 w-4" /> Upload</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('auth.main_color')}</Label><div className="flex gap-2 mt-1"><input type="color" defaultValue="#4f46e5" className="w-8 h-8 rounded border-0 cursor-pointer" /><Input defaultValue="#4f46e5" className="h-8 text-xs" /></div></div>
              <div><Label>{t('auth.text_color')}</Label><div className="flex gap-2 mt-1"><input type="color" defaultValue="#ffffff" className="w-8 h-8 rounded border-0 cursor-pointer" /><Input defaultValue="#ffffff" className="h-8 text-xs" /></div></div>
            </div>
            <div><Label>{t('auth.welcome_msg')}</Label><Input className="mt-1" /></div>
            <Button type="submit" disabled={loading}>{loading ? t('common.loading') : t('admin.create_merchant')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}