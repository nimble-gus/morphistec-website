import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const safeTitle = typeof title === "string" ? title : "";
  const safeDescription = typeof description === "string" ? description : "";
  const safeImage = typeof image === "string" ? image : "";
  const safeUrl = typeof url === "string" ? url : "";

  return (
    <Head>
      {/* Título */}
      <title>{safeTitle}</title>

      {/* Meta tags */}
      {safeDescription && <meta name="description" content={safeDescription} />}
      {safeUrl && <link rel="canonical" href={safeUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      {safeTitle && <meta property="og:title" content={safeTitle} />}
      {safeDescription && <meta property="og:description" content={safeDescription} />}
      {safeImage && <meta property="og:image" content={safeImage} />}
      {safeUrl && <meta property="og:url" content={safeUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {safeTitle && <meta name="twitter:title" content={safeTitle} />}
      {safeDescription && <meta name="twitter:description" content={safeDescription} />}
      {safeImage && <meta name="twitter:image" content={safeImage} />}
    </Head>
  );
};

export default SEO;
