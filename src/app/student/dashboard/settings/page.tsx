"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/context/I18nContext";

export default function StudentSettingsPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("settings.title")}</h1>
        <p className="text-gray-600">{t("settings.description")}</p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle>{t("settings.languageRegion")}</CardTitle>
                <CardDescription>
                  {t("settings.languageDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("settings.interfaceLanguage")}
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  {t("settings.languageSelectDescription")}
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

