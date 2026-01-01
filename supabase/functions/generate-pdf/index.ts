// import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
// import { encode as encodeQR } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

// // ==========================================
// // CONFIGURATION
// // ==========================================
// const CONFIG = {
//   PDF_BUCKET: "order-tickets",
//   DEFAULT_EXPIRATION_DAYS: 30,
//   MAX_RETRIES: 3,
//   RETRY_DELAY: 500,

//   // URLs de recursos
//   DEFAULT_LOGO_URL: "https://jtfcfsnksywotlbsddqb.supabase.co/storage/v1/object/public/default/logos/hunt_logo.png",

//   MAX_TICKETS_PER_PDF: 50,
//   MAX_IMAGE_SIZE: 5 * 1024 * 1024,
//   MAX_PDF_SIZE: 50 * 1024 * 1024,
//   IMAGE_DOWNLOAD_TIMEOUT: 10000,
// };

// // Environment variables
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
//   throw new Error("Missing required environment variables");
// }

// const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// // ==========================================
// // UTILITIES
// // ==========================================
// function logger(level: string, message: string, context = {}) {
//   console.log(JSON.stringify({
//     level,
//     message,
//     timestamp: new Date().toISOString(),
//     service: "pdf_generator",
//     ...context
//   }));
// }

// async function withRetry<T>(
//   operation: () => Promise<T>,
//   maxRetries = CONFIG.MAX_RETRIES,
//   delay = CONFIG.RETRY_DELAY,
//   context = "operation"
// ): Promise<T> {
//   let lastError;
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       return await operation();
//     } catch (error) {
//       lastError = error;
//       logger("warn", `Attempt ${attempt}/${maxRetries} failed for ${context}`, {
//         error: error.message,
//         retry_attempt: attempt
//       });
//       if (attempt < maxRetries) {
//         const waitTime = delay * Math.pow(2, attempt - 1);
//         await new Promise(resolve => setTimeout(resolve, waitTime));
//       }
//     }
//   }
//   throw lastError;
// }

// function getLocalEventTime(eventDate: Date | string, timezone = "America/Bogota") {
//   try {
//     const formatter = new Intl.DateTimeFormat('fr-CA', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false,
//       timeZone: timezone
//     });

//     const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
//     const parts = formatter.formatToParts(date);
//     const dateParts: Record<string, string> = {};

//     parts.forEach(part => {
//       if (part.type !== 'literal') {
//         dateParts[part.type] = part.value;
//       }
//     });

//     return new Date(
//       `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
//     );
//   } catch (error) {
//     logger("warn", `Error adjusting timezone: ${error.message}`);
//     const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
//     return new Date(date.getTime() - 5 * 60 * 60 * 1000);
//   }
// }

// function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
//   const words = text.split(' ');
//   const lines: string[] = [];
//   let currentLine = words[0];

//   for (let i = 1; i < words.length; i++) {
//     const word = words[i];
//     const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
//     if (width < maxWidth) {
//       currentLine += ` ${word}`;
//     } else {
//       lines.push(currentLine);
//       currentLine = word;
//     }
//   }
//   lines.push(currentLine);
//   return lines;
// }

// function justifyText(text: string, font: any, fontSize: number, maxWidth: number) {
//   const words = text.split(' ');
//   const lines: Array<{ line: string; wordSpacing: number }> = [];
//   let currentWords: string[] = [];
//   let currentWidth = 0;

//   for (const word of words) {
//     const wordWidth = font.widthOfTextAtSize(word, fontSize);
//     const spaceWidth = font.widthOfTextAtSize(' ', fontSize);

//     if (currentWords.length === 0) {
//       currentWords.push(word);
//       currentWidth = wordWidth;
//     } else if (currentWidth + spaceWidth + wordWidth <= maxWidth) {
//       currentWords.push(word);
//       currentWidth += spaceWidth + wordWidth;
//     } else {
//       const lineText = currentWords.join(' ');
//       const naturalWidth = font.widthOfTextAtSize(lineText, fontSize);
//       const spaces = currentWords.length - 1;
//       const extraSpace = spaces > 0 ? (maxWidth - naturalWidth) / spaces : 0;

//       lines.push({
//         line: lineText,
//         wordSpacing: extraSpace
//       });

//       currentWords = [word];
//       currentWidth = wordWidth;
//     }
//   }

//   if (currentWords.length > 0) {
//     lines.push({
//       line: currentWords.join(' '),
//       wordSpacing: 0
//     });
//   }

//   return lines;
// }

// // ==========================================
// // DATA FETCHING - ADAPTED FOR DRIZZLE SCHEMA
// // ==========================================

// async function getOrderData(orderId: string) {
//   logger("info", "Fetching order data", { order_id: orderId });

//   const { data: order, error } = await supabase
//     .from("orders")
//     .select(`
//       *,
//       event:eventId(*)
//     `)
//     .eq("id", orderId)
//     .single();

//   if (error || !order) {
//     throw new Error(`Order ${orderId} not found: ${error?.message}`);
//   }

//   logger("info", "Order data fetched successfully", {
//     order_id: orderId,
//     event_id: order.eventId,
//     user_id: order.userId
//   });

//   return order;
// }

// async function getEventAndVenue(eventId: string) {
//   logger("info", "Fetching event and venue", { event_id: eventId });

//   const { data: event, error } = await supabase
//     .from("events")
//     .select(`
//       *,
//       venue:venueId(*)
//     `)
//     .eq("id", eventId)
//     .single();

//   if (error || !event) {
//     throw new Error(`Event not found: ${error?.message}`);
//   }

//   logger("info", "Event and venue fetched successfully", {
//     event_id: eventId,
//     venue_id: event.venueId
//   });

//   return {
//     event,
//     venue: event.venue
//   };
// }

// async function getUserProfile(userId: string) {
//   logger("info", "Fetching user profile", { user_id: userId });

//   const { data: user, error } = await supabase
//     .from("user")
//     .select("*")
//     .eq("id", userId)
//     .single();

//   if (error || !user) {
//     throw new Error(`User not found: ${error?.message}`);
//   }

//   logger("info", "User profile fetched successfully", { user_id: userId });

//   return user;
// }

// async function getOrderTickets(orderId: string) {
//   logger("info", "Fetching order tickets", { order_id: orderId });

//   const { data: tickets, error } = await supabase
//     .from("tickets")
//     .select(`
//       *,
//       ticketType:ticketTypeId(*)
//     `)
//     .eq("orderId", orderId);

//   if (error) {
//     throw new Error(`Failed to fetch tickets: ${error.message}`);
//   }

//   if (!tickets || tickets.length === 0) {
//     throw new Error(`No tickets found for order ${orderId}`);
//   }

//   logger("info", "Tickets fetched successfully", {
//     order_id: orderId,
//     ticket_count: tickets.length
//   });

//   return tickets;
// }

// // ==========================================
// // IMAGE LOADING
// // ==========================================

// async function fetchImage(url: string): Promise<Uint8Array> {
//   if (!url) {
//     throw new Error("Invalid image URL");
//   }

//   logger("info", "Downloading image", { url });

//   const response = await withRetry(
//     async () => {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(
//         () => controller.abort(),
//         CONFIG.IMAGE_DOWNLOAD_TIMEOUT
//       );

//       try {
//         const res = await fetch(url, { signal: controller.signal });
//         clearTimeout(timeoutId);
//         return res;
//       } catch (error) {
//         clearTimeout(timeoutId);
//         throw error;
//       }
//     },
//     CONFIG.MAX_RETRIES,
//     CONFIG.RETRY_DELAY,
//     `image download ${url}`
//   );

//   if (!response.ok) {
//     throw new Error(`Failed to download image: ${response.statusText}`);
//   }

//   const arrayBuffer = await response.arrayBuffer();

//   if (arrayBuffer.byteLength === 0) {
//     throw new Error("Downloaded image is empty");
//   }

//   if (arrayBuffer.byteLength > CONFIG.MAX_IMAGE_SIZE) {
//     throw new Error(`Image too large: ${arrayBuffer.byteLength} bytes`);
//   }

//   logger("info", "Image downloaded successfully", {
//     url,
//     size: arrayBuffer.byteLength
//   });

//   return new Uint8Array(arrayBuffer);
// }

// async function loadResources(event: any, pdfDoc: PDFDocument) {
//   const startTime = Date.now();
//   logger("info", "Loading PDF resources");

//   const resources: Record<string, any> = {};

//   try {
//     // Load logo
//     const logoData = await fetchImage(CONFIG.DEFAULT_LOGO_URL);
//     resources.logo = await pdfDoc.embedPng(logoData);

//     // Load event flyer if available
//     if (event.flyer) {
//       try {
//         const flyerData = await fetchImage(event.flyer);
//         const url = event.flyer.toLowerCase();

//         if (url.includes('.jpg') || url.includes('.jpeg') ||
//             (flyerData[0] === 0xFF && flyerData[1] === 0xD8 && flyerData[2] === 0xFF)) {
//           resources.flyer = await pdfDoc.embedJpg(flyerData);
//         } else {
//           resources.flyer = await pdfDoc.embedPng(flyerData);
//         }
//       } catch (error) {
//         logger("error", `Failed to load flyer: ${error.message}`);
//         resources.flyer = null;
//       }
//     } else {
//       resources.flyer = null;
//     }

//   } catch (error) {
//     logger("error", "Error loading resources", { error: error.message });
//     throw error;
//   }

//   const loadTime = Date.now() - startTime;
//   logger("info", "Resources loaded successfully", {
//     load_time: loadTime,
//     loaded_resources: Object.keys(resources).filter(k => resources[k] !== null)
//   });

//   return resources;
// }

// // ==========================================
// // QR CODE GENERATION
// // ==========================================

// async function generateQRCode(data: string): Promise<Uint8Array> {
//   try {
//     // Generate QR code as PNG
//     const qrImage = await encodeQR(data, {
//       type: "png",
//       size: 300,
//       errorCorrectionLevel: "H"
//     });

//     return qrImage;
//   } catch (error) {
//     logger("error", `Failed to generate QR code: ${error.message}`);
//     throw error;
//   }
// }

// // ==========================================
// // PRE-CALCULATION
// // ==========================================

// function preCalculateCommonElements(order: any, event: any, venue: any, user: any, ticketType: any, fonts: any) {
//   const timezone = venue.timezoneId || "America/Bogota";
//   const eventDate = new Date(event.date);
//   const eventDateLocal = getLocalEventTime(eventDate, timezone);

//   const formattedDate = eventDateLocal.toLocaleDateString("es-CO", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric"
//   });

//   const formattedTime = eventDateLocal.toLocaleTimeString("es-CO", {
//     hour: "2-digit",
//     minute: "2-digit"
//   });

//   const timeZoneAbbr = new Intl.DateTimeFormat('es', {
//     timeZoneName: 'short',
//     timeZone: timezone
//   }).formatToParts(eventDate).find(part => part.type === 'timeZoneName')?.value || 'COT';

//   const orderId = order.id.substring(0, 8);

//   const legalText = "Este ticket es personal e intransferible salvo uso de la funcionalidad de transferencia dentro de la plataforma de Hunt Tickets. Su uso indebido, reproducción o alteración anula su validez. El ingreso al evento está sujeto a la verificación de este código único por parte del organizador. HUNT TICKETS S.A.S. actúa exclusivamente como proveedor de servicios tecnológicos para la distribución de entradas. No es el organizador, productor ni responsable del evento, ni de posibles cambios, cancelaciones o condiciones del mismo. Cualquier solicitud de devolución, reclamo, modificación del evento o atención relacionada con la experiencia del usuario debe ser dirigida al organizador del evento. La asistencia al evento implica la aceptación de los términos y condiciones publicados por el organizador. No se permite la reventa. El ingreso está sujeto a las normas del lugar del evento y a la legislación vigente.";

//   const legalTextJustified = justifyText(legalText, fonts.helveticaLight, 5.5, 250);

//   return {
//     formattedDate,
//     formattedTime,
//     timeZoneAbbr,
//     eventDateLocal,
//     orderId,
//     legalTextJustified,
//     eventName: event.name,
//     venueName: venue.name,
//     venueAddress: venue.address || venue.city || "",
//     ticketName: ticketType.name,
//     userEmail: user.email,
//     userName: user.name,
//     margin: 40,
//     contentWidth: 595 - 80,
//     halfWidth: (595 - 80) / 2,
//     standardSpacing: 40,
//     headerHeight: 65,
//     qrCodeWidth: 160,
//     colors: {
//       black: rgb(0, 0, 0),
//       white: rgb(1, 1, 1),
//       gray: rgb(0.5, 0.5, 0.5),
//       lightGray: rgb(0.8, 0.8, 0.8),
//       darkGray: rgb(0.3, 0.3, 0.3)
//     }
//   };
// }

// // ==========================================
// // PDF PAGE GENERATION
// // ==========================================

// async function generatePDFPage(
//   pdfDoc: PDFDocument,
//   pageIndex: number,
//   ticket: any,
//   qrImage: any,
//   order: any,
//   event: any,
//   venue: any,
//   user: any,
//   resources: any,
//   fonts: any,
//   totalPages: number,
//   commonElements: any
// ) {
//   const page = pdfDoc.addPage([595, 842]); // A4
//   const { width, height } = page.getSize();
//   const { margin, contentWidth, halfWidth, standardSpacing, headerHeight, qrCodeWidth, colors } = commonElements;
//   const { helvetica, helveticaBold, helveticaLight } = fonts;

//   // HEADER
//   page.drawRectangle({
//     x: 0,
//     y: height - headerHeight,
//     width: width,
//     height: headerHeight,
//     color: colors.black
//   });

//   // Logo
//   if (resources.logo) {
//     const logoWidth = 75;
//     const logoHeight = logoWidth * (resources.logo.height / resources.logo.width);
//     page.drawImage(resources.logo, {
//       x: margin,
//       y: height - headerHeight / 2 - logoHeight / 2,
//       width: logoWidth,
//       height: logoHeight
//     });
//   } else {
//     page.drawText("HUNT TICKETS", {
//       x: margin,
//       y: height - headerHeight / 2 - 10,
//       size: 21,
//       font: helveticaBold,
//       color: colors.white
//     });
//   }

//   // Order ID
//   const orderText = `#${commonElements.orderId}`;
//   const orderTextWidth = helvetica.widthOfTextAtSize(orderText, 10);
//   page.drawText(orderText, {
//     x: width - margin - orderTextWidth,
//     y: height - headerHeight / 2 - 5,
//     size: 10,
//     font: helvetica,
//     color: rgb(0.8, 0.8, 0.8)
//   });

//   // CONTENT - 2 columns
//   const topSectionY = height - headerHeight;
//   const startY = topSectionY - standardSpacing;

//   // Flyer
//   const flyerWidth = halfWidth - 15;
//   let flyerHeight = flyerWidth * (1350 / 1080);

//   if (resources.flyer) {
//     const imageAspectRatio = resources.flyer.height / resources.flyer.width;
//     flyerHeight = flyerWidth * imageAspectRatio;

//     try {
//       page.drawImage(resources.flyer, {
//         x: margin,
//         y: startY - flyerHeight,
//         width: flyerWidth,
//         height: flyerHeight
//       });
//     } catch (drawError) {
//       logger("error", `Error drawing flyer: ${drawError.message}`);
//     }
//   } else {
//     page.drawRectangle({
//       x: margin,
//       y: startY - flyerHeight,
//       width: flyerWidth,
//       height: flyerHeight,
//       borderWidth: 1,
//       borderColor: rgb(0.7, 0.7, 0.7),
//       color: rgb(0.95, 0.95, 0.95)
//     });

//     const noImageText = "Imagen no disponible";
//     const textWidth = helvetica.widthOfTextAtSize(noImageText, 12);
//     page.drawText(noImageText, {
//       x: margin + (flyerWidth - textWidth) / 2,
//       y: startY - flyerHeight / 2,
//       size: 12,
//       font: helvetica,
//       color: colors.gray
//     });
//   }

//   // Event info (right column)
//   const rightColumnX = margin + halfWidth + 15;
//   const eventNameY = startY - 40;

//   page.drawText(commonElements.eventName, {
//     x: rightColumnX,
//     y: eventNameY,
//     size: 14,
//     font: helveticaBold,
//     color: colors.black
//   });

//   page.drawText(
//     `${commonElements.formattedDate} ${commonElements.formattedTime} ${commonElements.timeZoneAbbr}`,
//     {
//       x: rightColumnX,
//       y: eventNameY - 20,
//       size: 10,
//       font: helvetica,
//       color: colors.black
//     }
//   );

//   // VENUE
//   const lugarY = eventNameY - 50;
//   page.drawText("LUGAR", {
//     x: rightColumnX,
//     y: lugarY,
//     size: 10,
//     font: helvetica,
//     color: colors.gray
//   });

//   page.drawText(commonElements.venueName, {
//     x: rightColumnX,
//     y: lugarY - 20,
//     size: 12,
//     font: helveticaBold,
//     color: colors.black
//   });

//   page.drawText(commonElements.venueAddress, {
//     x: rightColumnX,
//     y: lugarY - 35,
//     size: 10,
//     font: helvetica,
//     color: colors.black
//   });

//   // TICKET TYPE
//   const entradaY = lugarY - 65;
//   page.drawText("ENTRADA", {
//     x: rightColumnX,
//     y: entradaY,
//     size: 10,
//     font: helvetica,
//     color: colors.gray
//   });

//   page.drawText(commonElements.ticketName, {
//     x: rightColumnX,
//     y: entradaY - 20,
//     size: 12,
//     font: helveticaBold,
//     color: colors.black
//   });

//   page.drawText(`Orden: #${commonElements.orderId}`, {
//     x: rightColumnX,
//     y: entradaY - 35,
//     size: 10,
//     font: helvetica,
//     color: colors.black
//   });

//   // BUYER EMAIL
//   const titularY = entradaY - 65;
//   page.drawText("CORREO COMPRADOR", {
//     x: rightColumnX,
//     y: titularY,
//     size: 10,
//     font: helvetica,
//     color: colors.gray
//   });

//   page.drawText(commonElements.userEmail, {
//     x: rightColumnX,
//     y: titularY - 20,
//     size: 12,
//     font: helveticaBold,
//     color: colors.black
//   });

//   // DIVIDER LINE
//   const middleY = startY - flyerHeight - standardSpacing;
//   page.drawLine({
//     start: { x: margin, y: middleY },
//     end: { x: width - margin, y: middleY },
//     thickness: 1,
//     color: colors.lightGray
//   });

//   // BOTTOM SECTION
//   const bottomSectionY = middleY - standardSpacing;
//   const infoSectionX = margin;
//   const infoSectionWidth = halfWidth - 15;
//   const sectionSpacing = 15;

//   // Title
//   page.drawText("Información del ticket", {
//     x: infoSectionX,
//     y: bottomSectionY,
//     size: 12,
//     font: helveticaBold,
//     color: colors.black
//   });

//   // Ecosystem text
//   const ecosistemaText = "Con Hunt Tickets, tus entradas están disponibles en tu correo electrónico como archivo PDF. Presenta este código QR al ingresar al evento.";
//   const ecosistemaLines = wrapText(ecosistemaText, helvetica, 9, infoSectionWidth);

//   let currentY = bottomSectionY - 25;
//   ecosistemaLines.forEach(line => {
//     page.drawText(line, {
//       x: infoSectionX,
//       y: currentY,
//       size: 9,
//       font: helvetica,
//       color: colors.black
//     });
//     currentY -= 15;
//   });

//   // Legal text
//   currentY -= sectionSpacing + 5;
//   const legalSize = 5.5;

//   commonElements.legalTextJustified.forEach((item: any) => {
//     if (item.wordSpacing > 0) {
//       const words = item.line.split(' ');
//       let xPos = infoSectionX;

//       words.forEach((word: string, index: number) => {
//         page.drawText(word, {
//           x: xPos,
//           y: currentY,
//           size: legalSize,
//           font: helveticaLight,
//           color: colors.darkGray
//         });

//         if (index < words.length - 1) {
//           const wordWidth = helveticaLight.widthOfTextAtSize(word, legalSize);
//           const spaceWidth = helveticaLight.widthOfTextAtSize(' ', legalSize);
//           xPos += wordWidth + spaceWidth + item.wordSpacing;
//         }
//       });
//     } else {
//       page.drawText(item.line, {
//         x: infoSectionX,
//         y: currentY,
//         size: legalSize,
//         font: helveticaLight,
//         color: colors.darkGray
//       });
//     }
//     currentY -= 8;
//   });

//   // QR CODE
//   const qrRightX = width - margin;
//   const qrLeftX = qrRightX - qrCodeWidth;
//   const qrCenterX = qrLeftX + qrCodeWidth / 2;

//   // Scanner text
//   const scannerText = "ESTE CÓDIGO SERÁ ESCANEADO AL MOMENTO DE INGRESAR AL EVENTO";
//   const scannerFontSize = 8;
//   const scannerY = bottomSectionY - 5;
//   const wrappedScannerText = wrapText(scannerText, helvetica, scannerFontSize, qrCodeWidth);
//   const scannerTextHeight = wrappedScannerText.length * 12;

//   wrappedScannerText.forEach((line, index) => {
//     const lineWidth = helvetica.widthOfTextAtSize(line, scannerFontSize);
//     page.drawText(line, {
//       x: qrCenterX - lineWidth / 2,
//       y: scannerY - index * 12,
//       size: scannerFontSize,
//       font: helvetica,
//       color: colors.gray
//     });
//   });

//   // QR Image
//   const qrY = scannerY - scannerTextHeight - 10;

//   if (qrImage) {
//     page.drawImage(qrImage, {
//       x: qrLeftX,
//       y: qrY - qrCodeWidth,
//       width: qrCodeWidth,
//       height: qrCodeWidth
//     });
//   } else {
//     // Placeholder
//     page.drawRectangle({
//       x: qrLeftX,
//       y: qrY - qrCodeWidth,
//       width: qrCodeWidth,
//       height: qrCodeWidth,
//       borderWidth: 2,
//       borderColor: colors.black,
//       color: colors.white
//     });

//     const infoText = "Código de verificación";
//     const infoTextWidth = helvetica.widthOfTextAtSize(infoText, 14);
//     page.drawText(infoText, {
//       x: qrCenterX - infoTextWidth / 2,
//       y: qrY - qrCodeWidth / 2 + 10,
//       size: 14,
//       font: helveticaBold,
//       color: colors.black
//     });

//     const idText = ticket.id;
//     const idTextWidth = helvetica.widthOfTextAtSize(idText, 12);
//     page.drawText(idText, {
//       x: qrCenterX - idTextWidth / 2,
//       y: qrY - qrCodeWidth / 2 - 10,
//       size: 12,
//       font: helvetica,
//       color: colors.black
//     });
//   }

//   // QR ID
//   const qrIdText = `ID: ${ticket.id}`;
//   const qrIdWidth = helvetica.widthOfTextAtSize(qrIdText, 8);
//   page.drawText(qrIdText, {
//     x: qrCenterX - qrIdWidth / 2,
//     y: qrY - qrCodeWidth - 20,
//     size: 8,
//     font: helvetica,
//     color: colors.gray
//   });

//   // FOOTER
//   const footerY = 80;
//   const minSpaceAfterContent = 20;
//   const contentEndY = Math.min(currentY, qrY - qrCodeWidth - 20);
//   const lineY = Math.min(contentEndY - minSpaceAfterContent, footerY + standardSpacing);

//   // Footer line
//   page.drawLine({
//     start: { x: margin, y: lineY },
//     end: { x: width - margin, y: lineY },
//     thickness: 1,
//     color: colors.lightGray
//   });

//   // Contact info
//   page.drawText("info@hunt-tickets.com", {
//     x: margin,
//     y: footerY,
//     size: 8,
//     font: helvetica,
//     color: colors.black
//   });

//   page.drawText("WhatsApp: +573228597640", {
//     x: margin,
//     y: footerY - 12,
//     size: 8,
//     font: helvetica,
//     color: colors.black
//   });

//   page.drawText("www.hunt-tickets.com", {
//     x: margin,
//     y: footerY - 24,
//     size: 8,
//     font: helvetica,
//     color: colors.black
//   });

//   // Right info
//   const entradaText = `Entrada ${pageIndex + 1} de ${totalPages}`;
//   const entradaTextWidth = helvetica.widthOfTextAtSize(entradaText, 8);
//   page.drawText(entradaText, {
//     x: width - margin - entradaTextWidth,
//     y: footerY,
//     size: 8,
//     font: helvetica,
//     color: colors.black
//   });

//   const noDevolucionesText = "No se aceptan devoluciones";
//   const noDevolucionesWidth = helvetica.widthOfTextAtSize(noDevolucionesText, 8);
//   page.drawText(noDevolucionesText, {
//     x: width - margin - noDevolucionesWidth,
//     y: footerY - 12,
//     size: 8,
//     font: helvetica,
//     color: colors.black
//   });

//   const empresaText = "Hunt Tickets S.A.S. NIT 901881747-0";
//   const empresaWidth = helvetica.widthOfTextAtSize(empresaText, 8);
//   page.drawText(empresaText, {
//     x: width - margin - empresaWidth,
//     y: footerY - 24,
//     size: 8,
//     font: helveticaLight,
//     color: colors.black
//   });
// }

// // ==========================================
// // MAIN PDF GENERATION
// // ==========================================

// async function generatePDF(
//   order: any,
//   event: any,
//   venue: any,
//   user: any,
//   tickets: any[],
//   correlationId: string
// ) {
//   const startTime = Date.now();

//   if (tickets.length > CONFIG.MAX_TICKETS_PER_PDF) {
//     throw new Error(`Ticket count (${tickets.length}) exceeds maximum allowed (${CONFIG.MAX_TICKETS_PER_PDF})`);
//   }

//   const pdfDoc = await PDFDocument.create();

//   // Load fonts
//   const fonts = {
//     helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
//     helveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
//     helveticaLight: await pdfDoc.embedFont(StandardFonts.Helvetica)
//   };

//   logger("info", "Starting PDF generation", {
//     order_id: order.id,
//     pages_count: tickets.length,
//     correlation_id: correlationId
//   });

//   // Load resources
//   const resources = await loadResources(event, pdfDoc);

//   // Get ticket type from first ticket
//   const ticketType = tickets[0].ticketType;

//   // Pre-calculate common elements
//   const commonElements = preCalculateCommonElements(
//     order,
//     event,
//     venue,
//     user,
//     ticketType,
//     fonts
//   );

//   // Generate QR codes for all tickets
//   const qrImages = await Promise.all(
//     tickets.map(async (ticket) => {
//       try {
//         const qrData = await generateQRCode(ticket.qrCode);
//         const qrImage = await pdfDoc.embedPng(qrData);
//         return { ticket, qrImage };
//       } catch (error) {
//         logger("error", `Failed to generate QR for ticket ${ticket.id}: ${error.message}`);
//         return { ticket, qrImage: null };
//       }
//     })
//   );

//   logger("info", "QR codes generated", {
//     total: qrImages.length,
//     successful: qrImages.filter(qi => qi.qrImage !== null).length
//   });

//   // Generate pages
//   for (let i = 0; i < tickets.length; i++) {
//     const { ticket, qrImage } = qrImages[i];

//     await generatePDFPage(
//       pdfDoc,
//       i,
//       ticket,
//       qrImage,
//       order,
//       event,
//       venue,
//       user,
//       resources,
//       fonts,
//       tickets.length,
//       commonElements
//     );
//   }

//   // Save PDF
//   const pdfBytes = await pdfDoc.save({
//     useObjectStreams: false,
//     addDefaultPage: false,
//     objectsPerTick: 50,
//     updateFieldAppearances: false
//   });

//   if (pdfBytes.byteLength > CONFIG.MAX_PDF_SIZE) {
//     throw new Error(`PDF too large: ${pdfBytes.byteLength} bytes`);
//   }

//   const totalTime = Date.now() - startTime;
//   const pdfSizeMB = (pdfBytes.byteLength / 1024 / 1024).toFixed(2);

//   logger("info", "PDF generated successfully", {
//     pdf_size_mb: pdfSizeMB,
//     total_time: totalTime,
//     pages_generated: tickets.length,
//     correlation_id: correlationId
//   });

//   return pdfBytes;
// }

// // ==========================================
// // STORAGE
// // ==========================================

// async function storePDF(orderId: string, pdfBytes: Uint8Array): Promise<string> {
//   try {
//     const filePath = `${orderId}/tickets.pdf`;

//     const { error } = await supabase.storage
//       .from(CONFIG.PDF_BUCKET)
//       .upload(filePath, pdfBytes, {
//         contentType: "application/pdf",
//         upsert: true
//       });

//     if (error) {
//       throw error;
//     }

//     logger("info", "PDF stored successfully", {
//       order_id: orderId,
//       bucket: CONFIG.PDF_BUCKET,
//       file_path: filePath,
//       size: pdfBytes.byteLength
//     });

//     return filePath;
//   } catch (error) {
//     logger("error", "Failed to store PDF", {
//       order_id: orderId,
//       error: error.message
//     });
//     throw error;
//   }
// }

// async function createSignedURL(filePath: string, eventEndDate?: string) {
//   try {
//     let expiresIn;

//     if (eventEndDate) {
//       const endDate = new Date(eventEndDate);
//       const sevenDaysAfter = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
//       const now = new Date();

//       if (sevenDaysAfter > now) {
//         expiresIn = Math.floor((sevenDaysAfter.getTime() - now.getTime()) / 1000);
//       } else {
//         expiresIn = 60 * 60; // 1 hour default
//       }
//     } else {
//       expiresIn = CONFIG.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60; // 30 days
//     }

//     const { data, error } = await supabase.storage
//       .from(CONFIG.PDF_BUCKET)
//       .createSignedUrl(filePath, expiresIn);

//     if (error) {
//       throw error;
//     }

//     return {
//       url: data.signedUrl,
//       expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
//     };
//   } catch (error) {
//     logger("error", "Failed to create signed URL", {
//       file_path: filePath,
//       error: error.message
//     });
//     throw error;
//   }
// }

// // ==========================================
// // MAIN HANDLER
// // ==========================================

// serve(async (req) => {
//   const requestId = crypto.randomUUID();
//   const startTime = Date.now();

//   logger("info", "New request", {
//     request_id: requestId,
//     method: req.method,
//     url: req.url
//   });

//   try {
//     // Health check
//     if (req.method === 'GET' && req.url.endsWith('/health')) {
//       return new Response(JSON.stringify({
//         status: 'healthy',
//         timestamp: new Date().toISOString(),
//         service: 'pdf_generator',
//         version: '1.0.0'
//       }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId }
//       });
//     }

//     if (req.method !== "POST") {
//       return new Response(JSON.stringify({
//         error: "Method not allowed. Use POST.",
//         code: "METHOD_NOT_ALLOWED"
//       }), {
//         status: 405,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Parse request body
//     const body = await req.json();
//     const { order_id, force_regenerate = false } = body;

//     if (!order_id) {
//       return new Response(JSON.stringify({
//         error: "order_id is required",
//         code: "MISSING_ORDER_ID"
//       }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Check if PDF already exists
//     if (!force_regenerate) {
//       const filePath = `${order_id}/tickets.pdf`;
//       const { data } = await supabase.storage
//         .from(CONFIG.PDF_BUCKET)
//         .list(order_id, { search: 'tickets.pdf' });

//       if (data && data.length > 0) {
//         logger("info", "PDF already exists", { order_id });

//         // Get order to fetch event end date
//         const order = await getOrderData(order_id);
//         const { event } = await getEventAndVenue(order.eventId);

//         const { url, expiresAt } = await createSignedURL(filePath, event.endDate);

//         return new Response(JSON.stringify({
//           success: true,
//           pdf_url: url,
//           expires_at: expiresAt,
//           cached: true
//         }), {
//           status: 200,
//           headers: {
//             "Content-Type": "application/json",
//             "X-Request-ID": requestId
//           }
//         });
//       }
//     }

//     // Generate new PDF
//     logger("info", "Generating new PDF", {
//       order_id,
//       force_regenerate
//     });

//     // Fetch all required data
//     const [order, tickets] = await Promise.all([
//       getOrderData(order_id),
//       getOrderTickets(order_id)
//     ]);

//     const [{ event, venue }, user] = await Promise.all([
//       getEventAndVenue(order.eventId),
//       getUserProfile(order.userId)
//     ]);

//     // Generate PDF
//     const pdfBytes = await generatePDF(
//       order,
//       event,
//       venue,
//       user,
//       tickets,
//       requestId
//     );

//     // Store PDF
//     const filePath = await storePDF(order_id, pdfBytes);

//     // Create signed URL
//     const { url, expiresAt } = await createSignedURL(filePath, event.endDate);

//     const processingTime = Date.now() - startTime;

//     logger("info", "PDF generation completed", {
//       request_id: requestId,
//       order_id,
//       processing_time: processingTime
//     });

//     return new Response(JSON.stringify({
//       success: true,
//       pdf_url: url,
//       expires_at: expiresAt,
//       cached: false,
//       stats: {
//         processing_time: processingTime,
//         ticket_count: tickets.length,
//         pdf_size: pdfBytes.byteLength
//       }
//     }), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "X-Request-ID": requestId,
//         "X-Processing-Time": processingTime.toString()
//       }
//     });

//   } catch (error) {
//     const processingTime = Date.now() - startTime;

//     logger("error", "Request failed", {
//       request_id: requestId,
//       error: error.message,
//       stack: error.stack,
//       processing_time: processingTime
//     });

//     return new Response(JSON.stringify({
//       error: "Internal server error",
//       message: error.message,
//       code: "INTERNAL_SERVER_ERROR"
//     }), {
//       status: 500,
//       headers: {
//         "Content-Type": "application/json",
//         "X-Request-ID": requestId
//       }
//     });
//   }
// });
