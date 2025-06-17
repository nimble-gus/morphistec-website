import { Helmet } from "react-helmet";

const SEO = ({
  title = "MorphisTec | Tu partner tecnológico",
  description = "Automatización, OCR, ecommerce y soluciones tecnológicas a la medida.",
  image = "https://morphistec.com/assets/logo2.png",
  url = "https://morphistec.com",
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />
    <meta name="robots" content="index, follow" />
    <meta name="keywords" content="OCR, ecommerce, software, IA, tecnología, Guatemala, automatización" />

    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />

    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>
);

export default SEO;
