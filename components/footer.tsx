import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-bold text-[#1A1A2E]">Graphite</span>
        </Link>
        <p className="text-sm text-[#888888]">
          Built for GitHub Hackathon 2026
        </p>
      </div>
    </footer>
  )
}
