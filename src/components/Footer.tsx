export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 mt-12 border-t bg-muted text-center dark:bg-black dark:text-gray-400">
      <p className="text-sm">
        © {new Date().getFullYear()} FFF Esports. All rights reserved.
      </p>
      <div className="text-xs mt-1">
        Made with ❤️ by your team | <a href="/privacy" className="underline">Privacy</a> · <a href="/terms" className="underline">Terms</a>
      </div>
    </footer>
  );
}
