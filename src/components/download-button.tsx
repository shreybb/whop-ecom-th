export function DownloadButton() {
  return (
    <div className="fixed right-0 bottom-0 z-50 m-6">
      <a
        href="https://themewagon.com/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-gradient-to-r from-primary to-accent px-4 text-sm font-semibold whitespace-nowrap text-background hover:shadow-lg"
      >
        Download Now
      </a>
    </div>
  );
}
