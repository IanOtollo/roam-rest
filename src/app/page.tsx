import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { HomeContent } from "@/components/live/HomeContent";
import { getProperties } from "@/lib/store";

// Pages refresh at least every minute and instantly when the owner saves a change in /admin.
// On screen, the property data then follows the database live (see HomeContent).
export const revalidate = 60;

export default async function HomePage() {
  const properties = await getProperties();

  // Everything hidden or not added yet: show a friendly page instead of an empty one.
  if (properties.length === 0) {
    return (
      <>
        <Navbar />
        <main className="px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl tracking-tight sm:text-5xl">Stays are being added</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            We&apos;re getting our first homes ready. Message us on WhatsApp and we&apos;ll gladly help you find a place.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <HomeContent initial={properties} />
      </main>
      <Footer />
    </>
  );
}
