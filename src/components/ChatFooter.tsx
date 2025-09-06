import { useTranslation } from "react-i18next";

export const ChatFooter = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-secondary text-secondary-foreground py-3 px-4 flex-shrink-0">
      <div className="text-center">
        <p className="text-sm">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </div>
  );
};