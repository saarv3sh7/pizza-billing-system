package net.sarvesh.pizzabillingsystem.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import net.sarvesh.pizzabillingsystem.entity.Order;
import net.sarvesh.pizzabillingsystem.entity.OrderItem;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfInvoiceService {

    // Standard 80mm thermal printer roll width (approx 226 points wide)
    private static final Rectangle THERMAL_ROLL_SIZE = new Rectangle(226, 800);
    private static final Font FONT_BOLD = FontFactory.getFont(FontFactory.COURIER_BOLD, 9);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.COURIER, 9);
    private static final Font FONT_SMALL = FontFactory.getFont(FontFactory.COURIER, 8);
    private static final String DASHED_LINE = "----------------------------------------";

    public byte[] generateInvoicePdf(Order order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(THERMAL_ROLL_SIZE, 10, 10, 10, 10);
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. Header (Store Details)
            Paragraph header = new Paragraph("Caffè Sogno\n", FONT_BOLD);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph address = new Paragraph("Paud Road, Shanti Nagar Layout,\nKothrud, Pune, 411038\nGST No 29ADDPR8125K1Z2\n", FONT_SMALL);
            address.setAlignment(Element.ALIGN_CENTER);
            document.add(address);

            // 2. Receipt Title
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));
            Paragraph receiptTitle = new Paragraph("RECEIPT", FONT_BOLD);
            receiptTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(receiptTitle);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 3. Order Metadata (Phone, Token, Invoice No, Date)
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            String dateStr = order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
            String phoneStr = (order.getCustomerMobile() != null) ? order.getCustomerMobile() : "Walk-in";

            metaTable.addCell(new Phrase("Phone: " + phoneStr, FONT_NORMAL));
            PdfPCell invCell = new PdfPCell(new Phrase("Inv No: " + order.getInvoiceNumber(), FONT_NORMAL));
            invCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            invCell.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(invCell);

            metaTable.addCell(new Phrase("Token: #" + order.getTokenNumber(), FONT_NORMAL));
            PdfPCell dateCell = new PdfPCell(new Phrase("Date: " + dateStr, FONT_NORMAL));
            dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            dateCell.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(dateCell);

            document.add(metaTable);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 4. Items Table Header
            PdfPTable itemsTable = new PdfPTable(new float[]{4f, 2f, 1f, 2f});
            itemsTable.setWidthPercentage(100);
            itemsTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            itemsTable.addCell(new Phrase("Item", FONT_BOLD));
            itemsTable.addCell(new Phrase("Price", FONT_BOLD));
            PdfPCell qtyHead = new PdfPCell(new Phrase("Qty", FONT_BOLD));
            qtyHead.setHorizontalAlignment(Element.ALIGN_CENTER);
            qtyHead.setBorder(Rectangle.NO_BORDER);
            itemsTable.addCell(qtyHead);

            PdfPCell totalHead = new PdfPCell(new Phrase("Total", FONT_BOLD));
            totalHead.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalHead.setBorder(Rectangle.NO_BORDER);
            itemsTable.addCell(totalHead);

            document.add(itemsTable);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 5. Order Items Iteration
            PdfPTable itemRows = new PdfPTable(new float[]{4f, 2f, 1f, 2f});
            itemRows.setWidthPercentage(100);
            itemRows.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            for (OrderItem item : order.getItems()) {
                // Includes the 5-digit item code and name
                String itemDisplay = item.getItemCode() + " " + item.getItemName();
                itemRows.addCell(new Phrase(itemDisplay, FONT_SMALL));

                itemRows.addCell(new Phrase("Rs." + item.getUnitPrice(), FONT_SMALL));

                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), FONT_SMALL));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                qtyCell.setBorder(Rectangle.NO_BORDER);
                itemRows.addCell(qtyCell);

                PdfPCell totalCell = new PdfPCell(new Phrase("Rs." + item.getSubtotal(), FONT_SMALL));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totalCell.setBorder(Rectangle.NO_BORDER);
                itemRows.addCell(totalCell);
            }
            document.add(itemRows);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 6. Totals & Taxes Table
            PdfPTable totalsTable = new PdfPTable(new float[]{5f, 2f, 2f});
            totalsTable.setWidthPercentage(100);
            totalsTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            totalsTable.getDefaultCell().setHorizontalAlignment(Element.ALIGN_RIGHT);

            // Sub-Total
            totalsTable.addCell(new Phrase("Sub-Total:", FONT_NORMAL));
            totalsTable.addCell(new Phrase(""));
            totalsTable.addCell(new Phrase("Rs." + order.getSubtotal(), FONT_NORMAL));

            // Delivery Charge (if applicable)
            if (order.getDeliveryCharge() != null && order.getDeliveryCharge().doubleValue() > 0) {
                totalsTable.addCell(new Phrase("Delivery:", FONT_NORMAL));
                totalsTable.addCell(new Phrase(""));
                totalsTable.addCell(new Phrase("Rs." + order.getDeliveryCharge(), FONT_NORMAL));
            }

            // CGST
            totalsTable.addCell(new Phrase("CGST:", FONT_NORMAL));
            totalsTable.addCell(new Phrase("2.5%", FONT_SMALL));
            totalsTable.addCell(new Phrase("Rs." + order.getCgst(), FONT_NORMAL));

            // SGST
            totalsTable.addCell(new Phrase("SGST:", FONT_NORMAL));
            totalsTable.addCell(new Phrase("2.5%", FONT_SMALL));
            totalsTable.addCell(new Phrase("Rs." + order.getSgst(), FONT_NORMAL));

            document.add(totalsTable);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 7. Grand Total and Payment Mode
            PdfPTable finalTable = new PdfPTable(2);
            finalTable.setWidthPercentage(100);
            finalTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            finalTable.addCell(new Phrase("Mode: " + order.getPaymentMethod(), FONT_BOLD));

            PdfPCell grandTotalCell = new PdfPCell(new Phrase("Total: Rs." + order.getTotalAmount(), FONT_BOLD));
            grandTotalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            grandTotalCell.setBorder(Rectangle.NO_BORDER);
            finalTable.addCell(grandTotalCell);

            document.add(finalTable);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 8. Footer (from 1.jpg)
            Paragraph footer = new Paragraph("**SAVE PAPER SAVE NATURE !!\n", FONT_SMALL);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            String timeStr = order.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm"));
            Paragraph timeLine = new Paragraph("Time: " + timeStr, FONT_SMALL);
            timeLine.setAlignment(Element.ALIGN_CENTER);
            document.add(timeLine);

            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF Invoice", e);
        }
    }
}