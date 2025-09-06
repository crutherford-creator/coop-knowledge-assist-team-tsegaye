export const ChatFooter = () => {
  return (
    <div className="bg-secondary text-secondary-foreground py-3 px-4 flex-shrink-0">
      <div className="text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Cooperative Bank of Oromia. All rights reserved.
        </p>
      </div>
    </div>
  );
};