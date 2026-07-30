export type LegalDoc = "terms" | "privacy" | "deletion";

export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  contact: string;
};

const CONTACT = "hola@oktae.tech";
const DELETION_CONTACT = "contacto@oktae.tech";

export const LEGAL = {
  es: {
    terms: {
      title: "Términos y condiciones",
      updated: "Última actualización: 30 de julio de 2026",
      intro:
        "Estos términos regulan el uso del sitio web de Oktae.Tech y la solicitud de servicios ofrecidos por Oktae. Al navegar o contactarnos a través de este sitio, aceptas estas condiciones.",
      sections: [
        {
          heading: "1. Identificación",
          body: [
            "Oktae.Tech (“Oktae”, “nosotros”) es un estudio de tecnología que ofrece servicios de diseño, desarrollo e integración de software para empresas, incluyendo e-commerce, aplicaciones a la medida, automatizaciones y dashboards.",
            `Contacto: ${CONTACT}`,
          ],
        },
        {
          heading: "2. Uso del sitio",
          body: [
            "El contenido de este sitio es informativo y comercial. Te comprometes a usarlo de forma lícita, sin intentar vulnerar su seguridad, recopilar datos de terceros de forma no autorizada ni usar el sitio para fines fraudulentos.",
            "Podemos modificar, suspender o retirar el sitio o cualquiera de sus secciones en cualquier momento.",
          ],
        },
        {
          heading: "3. Servicios",
          body: [
            "Las descripciones de servicios en este sitio son orientativas. El alcance, plazos, precios y entregables de cada proyecto se definen en una propuesta o contrato específico entre Oktae y el cliente.",
            "Ninguna publicación en el sitio constituye una oferta vinculante hasta que exista un acuerdo escrito aceptado por ambas partes.",
          ],
        },
        {
          heading: "4. Propiedad intelectual",
          body: [
            "Los textos, marcas, logotipos, diseños y demás materiales del sitio pertenecen a Oktae o a sus licenciantes. No está permitida su reproducción, distribución o uso comercial sin autorización previa por escrito.",
            "El software y entregables desarrollados para un cliente se rigen por el contrato correspondiente a ese proyecto.",
          ],
        },
        {
          heading: "5. Limitación de responsabilidad",
          body: [
            "El sitio se ofrece “tal cual”. En la medida permitida por la ley, Oktae no garantiza disponibilidad ininterrumpida ni ausencia de errores, ni responde por daños indirectos derivados del uso o la imposibilidad de uso del sitio.",
            "La responsabilidad contractual por proyectos de cliente se limita a lo estipulado en el contrato aplicable.",
          ],
        },
        {
          heading: "6. Enlaces de terceros",
          body: [
            "Este sitio puede incluir enlaces a sitios o redes de terceros (por ejemplo LinkedIn o Instagram). Oktae no controla ni responde por el contenido o las políticas de esos sitios.",
          ],
        },
        {
          heading: "7. Modificaciones",
          body: [
            "Podemos actualizar estos términos cuando sea necesario. La versión vigente se publicará en esta página con la fecha de actualización. El uso continuado del sitio tras un cambio implica la aceptación de la versión actualizada.",
          ],
        },
        {
          heading: "8. Ley aplicable",
          body: [
            "Estos términos se interpretan conforme a las leyes aplicables en Guatemala, sin perjuicio de derechos imperativos que te correspondan según tu jurisdicción.",
          ],
        },
      ],
      contact: `Para dudas sobre estos términos, escríbenos a ${CONTACT}.`,
    },
    privacy: {
      title: "Política de privacidad",
      updated: "Última actualización: 30 de julio de 2026",
      intro:
        "Esta política describe cómo Oktae.Tech (“Oktae”, “nosotros”) recopila, usa y protege la información personal cuando visitas oktae.tech, nos contactas o solicitas una llamada comercial. Cumple con las expectativas de transparencia exigidas por plataformas publicitarias como Meta.",
      sections: [
        {
          heading: "1. Responsable del tratamiento",
          body: [
            "Responsable: Oktae.Tech",
            `Correo de contacto para privacidad: ${CONTACT}`,
          ],
        },
        {
          heading: "2. Datos que recopilamos",
          body: [
            "Datos que nos facilitas: nombre, empresa, teléfono, correo electrónico y cualquier mensaje que envíes al agendar una llamada o contactarnos.",
            "Datos técnicos: dirección IP, tipo de navegador, páginas visitadas, fecha y hora de acceso, e identificadores de cookies o píxeles de medición cuando están activos.",
            "Datos de publicidad: si llegas a nuestro sitio desde anuncios de Meta (Facebook/Instagram) u otras plataformas, podemos recibir identificadores de campaña y eventos de conversión asociados a tu interacción.",
          ],
        },
        {
          heading: "3. Finalidades",
          body: [
            "Responder a solicitudes comerciales y agendar llamadas.",
            "Prestar y mejorar nuestros servicios.",
            "Medir el rendimiento de campañas publicitarias (incluido Meta Ads) y optimizar la comunicación comercial.",
            "Cumplir obligaciones legales aplicables.",
          ],
        },
        {
          heading: "4. Base legal y conservación",
          body: [
            "Tratamos tus datos con base en tu consentimiento (formularios), la ejecución de medidas precontractuales a tu solicitud, y el interés legítimo de Oktae en operar y mejorar el sitio y sus campañas, siempre que no prevalezcan tus derechos.",
            "Conservamos los datos el tiempo necesario para las finalidades anteriores o el exigido por ley. Luego los eliminamos o anonimizamos de forma segura.",
          ],
        },
        {
          heading: "5. Cookies, píxeles y Meta",
          body: [
            "Podemos usar cookies propias y de terceros, así como el píxel de Meta u herramientas equivalentes, para entender el uso del sitio, medir conversiones y mostrar anuncios relevantes.",
            "Puedes gestionar cookies desde la configuración de tu navegador. Bloquear ciertas cookies puede limitar funciones del sitio o la medición de campañas.",
            "Meta puede recibir información sobre visitas e interacciones conforme a sus propias políticas. Revisa la configuración de anuncios y privacidad en tu cuenta de Facebook/Instagram.",
          ],
        },
        {
          heading: "6. Destinatarios y encargados",
          body: [
            "Podemos compartir datos con proveedores que nos ayudan a operar el sitio y las comunicaciones (por ejemplo hosting, correo transaccional o herramientas de analítica/publicidad), bajo obligaciones de confidencialidad y seguridad.",
            "No vendemos tus datos personales.",
          ],
        },
        {
          heading: "7. Transferencias internacionales",
          body: [
            "Algunos proveedores pueden procesar datos fuera de Guatemala. En esos casos procuramos mecanismos adecuados de protección conforme a la práctica razonable del sector.",
          ],
        },
        {
          heading: "8. Seguridad",
          body: [
            "Aplicamos medidas técnicas y organizativas razonables para proteger la información personal frente a acceso no autorizado, pérdida o alteración. Ningún sistema es 100 % seguro; te pedimos que también cuides tus propios dispositivos y contraseñas.",
          ],
        },
        {
          heading: "9. Tus derechos",
          body: [
            "Puedes solicitar acceso, rectificación, actualización, eliminación u oposición al tratamiento de tus datos personales, y retirar tu consentimiento cuando el tratamiento se base en él, enviando un correo a " +
              CONTACT +
              ".",
            "Responderemos en un plazo razonable conforme a la normativa aplicable.",
          ],
        },
        {
          heading: "10. Menores",
          body: [
            "Nuestros servicios están dirigidos a empresas y profesionales. No recopilamos de forma consciente datos de menores de 18 años.",
          ],
        },
        {
          heading: "11. Cambios",
          body: [
            "Podemos actualizar esta política. Publicaremos la versión vigente en esta página con la fecha de actualización.",
          ],
        },
      ],
      contact: `Para ejercer derechos o resolver dudas de privacidad: ${CONTACT}.`,
    },
    deletion: {
      title: "Eliminación de datos",
      updated: "Última actualización: 30 de julio de 2026",
      intro:
        "Esta página explica cómo solicitar la eliminación de tus datos personales almacenados por Oktae.Tech, incluyendo datos asociados a formularios de contacto, agenda de llamadas y mediciones vinculadas a Meta (Facebook/Instagram).",
      sections: [
        {
          heading: "1. Cómo solicitar la eliminación",
          body: [
            `Envía un correo electrónico a ${DELETION_CONTACT} con el asunto: “Solicitud de eliminación de datos”.`,
            "En el cuerpo del mensaje incluye: tu nombre completo, el correo electrónico y/o teléfono que usaste al contactarnos, y una breve descripción de la solicitud (por ejemplo: eliminar datos de una llamada agendada o de interacciones con anuncios).",
          ],
        },
        {
          heading: "2. Qué eliminamos",
          body: [
            "Al recibir una solicitud válida, eliminaremos o anonimizaremos los datos personales que conservemos sobre ti en nuestros sistemas (por ejemplo formularios, solicitudes de llamada y registros de contacto asociados), salvo que debamos retenerlos por obligación legal o para resolver reclamaciones.",
            "Si tu solicitud también involucra datos tratados a través de Meta, te indicaremos los pasos adicionales que correspondan dentro de las herramientas de Meta cuando aplique.",
          ],
        },
        {
          heading: "3. Plazo de respuesta",
          body: [
            "Confirmaremos la recepción de tu solicitud y completaremos el proceso en un plazo razonable, normalmente dentro de 30 días desde que recibamos la información necesaria para identificarte.",
            "Si necesitamos más datos para verificar tu identidad o localizar tu información, te lo pediremos por el mismo correo.",
          ],
        },
        {
          heading: "4. Contacto",
          body: [
            `Único canal para solicitudes de eliminación de datos: ${DELETION_CONTACT}.`,
            "No uses otros correos para este trámite; así podemos registrar y atender tu solicitud de forma correcta.",
          ],
        },
      ],
      contact: `Envía tu solicitud de eliminación de datos a ${DELETION_CONTACT}.`,
    },
  },
  en: {
    terms: {
      title: "Terms and conditions",
      updated: "Last updated: July 30, 2026",
      intro:
        "These terms govern the use of the Oktae.Tech website and requests for services offered by Oktae. By browsing or contacting us through this site, you agree to these conditions.",
      sections: [
        {
          heading: "1. Identification",
          body: [
            "Oktae.Tech (“Oktae”, “we”) is a technology studio offering software design, development and integration services for businesses, including e-commerce, custom apps, automations and dashboards.",
            `Contact: ${CONTACT}`,
          ],
        },
        {
          heading: "2. Website use",
          body: [
            "Content on this site is informational and commercial. You agree to use it lawfully, without attempting to compromise its security, collecting third-party data without authorization, or using the site for fraudulent purposes.",
            "We may modify, suspend or withdraw the site or any section at any time.",
          ],
        },
        {
          heading: "3. Services",
          body: [
            "Service descriptions on this site are indicative. Scope, timelines, pricing and deliverables for each project are defined in a specific proposal or contract between Oktae and the client.",
            "Nothing on the site constitutes a binding offer until a written agreement is accepted by both parties.",
          ],
        },
        {
          heading: "4. Intellectual property",
          body: [
            "Texts, trademarks, logos, designs and other materials on the site belong to Oktae or its licensors. Reproduction, distribution or commercial use without prior written authorization is not permitted.",
            "Software and deliverables developed for a client are governed by the applicable project contract.",
          ],
        },
        {
          heading: "5. Limitation of liability",
          body: [
            "The site is provided “as is”. To the extent permitted by law, Oktae does not warrant uninterrupted availability or freedom from errors, and is not liable for indirect damages arising from use of or inability to use the site.",
            "Contractual liability for client projects is limited to what is stated in the applicable contract.",
          ],
        },
        {
          heading: "6. Third-party links",
          body: [
            "This site may include links to third-party sites or networks (for example LinkedIn or Instagram). Oktae does not control or accept responsibility for those sites’ content or policies.",
          ],
        },
        {
          heading: "7. Changes",
          body: [
            "We may update these terms when needed. The current version will be published on this page with the update date. Continued use of the site after a change means acceptance of the updated version.",
          ],
        },
        {
          heading: "8. Governing law",
          body: [
            "These terms are interpreted under the laws applicable in Guatemala, without prejudice to mandatory rights you may have in your jurisdiction.",
          ],
        },
      ],
      contact: `For questions about these terms, email us at ${CONTACT}.`,
    },
    privacy: {
      title: "Privacy policy",
      updated: "Last updated: July 30, 2026",
      intro:
        "This policy describes how Oktae.Tech (“Oktae”, “we”) collects, uses and protects personal information when you visit oktae.tech, contact us, or request a business call. It meets the transparency expectations required by advertising platforms such as Meta.",
      sections: [
        {
          heading: "1. Data controller",
          body: [
            "Controller: Oktae.Tech",
            `Privacy contact email: ${CONTACT}`,
          ],
        },
        {
          heading: "2. Data we collect",
          body: [
            "Data you provide: name, company, phone, email and any message you send when booking a call or contacting us.",
            "Technical data: IP address, browser type, pages visited, access date/time, and cookie or measurement pixel identifiers when active.",
            "Advertising data: if you reach our site from Meta ads (Facebook/Instagram) or other platforms, we may receive campaign identifiers and conversion events related to your interaction.",
          ],
        },
        {
          heading: "3. Purposes",
          body: [
            "Respond to commercial requests and schedule calls.",
            "Provide and improve our services.",
            "Measure advertising campaign performance (including Meta Ads) and optimize commercial communication.",
            "Comply with applicable legal obligations.",
          ],
        },
        {
          heading: "4. Legal basis and retention",
          body: [
            "We process your data based on your consent (forms), pre-contractual steps at your request, and Oktae’s legitimate interest in operating and improving the site and campaigns, provided your rights do not override that interest.",
            "We retain data for as long as needed for the purposes above or as required by law, then delete or anonymize it securely.",
          ],
        },
        {
          heading: "5. Cookies, pixels and Meta",
          body: [
            "We may use first-party and third-party cookies, as well as the Meta pixel or equivalent tools, to understand site usage, measure conversions and show relevant ads.",
            "You can manage cookies in your browser settings. Blocking certain cookies may limit site features or campaign measurement.",
            "Meta may receive information about visits and interactions under its own policies. Review ad and privacy settings in your Facebook/Instagram account.",
          ],
        },
        {
          heading: "6. Recipients and processors",
          body: [
            "We may share data with providers that help us operate the site and communications (for example hosting, transactional email or analytics/ads tools), under confidentiality and security obligations.",
            "We do not sell your personal data.",
          ],
        },
        {
          heading: "7. International transfers",
          body: [
            "Some providers may process data outside Guatemala. In those cases we seek appropriate protection mechanisms consistent with reasonable industry practice.",
          ],
        },
        {
          heading: "8. Security",
          body: [
            "We apply reasonable technical and organizational measures to protect personal information against unauthorized access, loss or alteration. No system is 100% secure; please also protect your own devices and passwords.",
          ],
        },
        {
          heading: "9. Your rights",
          body: [
            "You may request access, rectification, update, deletion or objection to processing of your personal data, and withdraw consent when processing is based on it, by emailing " +
              CONTACT +
              ".",
            "We will respond within a reasonable time under applicable law.",
          ],
        },
        {
          heading: "10. Minors",
          body: [
            "Our services are directed to businesses and professionals. We do not knowingly collect data from anyone under 18.",
          ],
        },
        {
          heading: "11. Changes",
          body: [
            "We may update this policy. We will publish the current version on this page with the update date.",
          ],
        },
      ],
      contact: `To exercise rights or ask privacy questions: ${CONTACT}.`,
    },
    deletion: {
      title: "Data deletion",
      updated: "Last updated: July 30, 2026",
      intro:
        "This page explains how to request deletion of your personal data held by Oktae.Tech, including data from contact forms, call booking, and measurement linked to Meta (Facebook/Instagram).",
      sections: [
        {
          heading: "1. How to request deletion",
          body: [
            `Send an email to ${DELETION_CONTACT} with the subject line: “Data deletion request”.`,
            "In the message body include: your full name, the email and/or phone number you used when contacting us, and a short description of the request (for example: delete data from a booked call or from ad interactions).",
          ],
        },
        {
          heading: "2. What we delete",
          body: [
            "Once we receive a valid request, we will delete or anonymize the personal data we hold about you in our systems (for example forms, call requests and related contact records), unless we must retain it for a legal obligation or to resolve claims.",
            "If your request also involves data processed through Meta, we will tell you any additional steps that apply within Meta’s tools when relevant.",
          ],
        },
        {
          heading: "3. Response time",
          body: [
            "We will confirm receipt of your request and complete the process within a reasonable time, typically within 30 days of receiving the information needed to identify you.",
            "If we need more information to verify your identity or locate your data, we will ask for it by the same email.",
          ],
        },
        {
          heading: "4. Contact",
          body: [
            `Only channel for data deletion requests: ${DELETION_CONTACT}.`,
            "Please do not use other email addresses for this process so we can log and handle your request correctly.",
          ],
        },
      ],
      contact: `Send your data deletion request to ${DELETION_CONTACT}.`,
    },
  },
} as const satisfies Record<"es" | "en", Record<LegalDoc, LegalDocument>>;
