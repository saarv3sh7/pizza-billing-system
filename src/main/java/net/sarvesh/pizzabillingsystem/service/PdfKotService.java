package net.sarvesh.pizzabillingsystem.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import net.sarvesh.pizzabillingsystem.entity.Order;
import net.sarvesh.pizzabillingsystem.entity.OrderItem;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfKotService {

    private static final Rectangle THERMAL_ROLL_SIZE = new Rectangle(226, 800);
    // Larger fonts for the kitchen staff
    private static final Font FONT_LARGE_BOLD = FontFactory.getFont(FontFactory.COURIER_BOLD, 12);
    private static final Font FONT_BOLD = FontFactory.getFont(FontFactory.COURIER_BOLD, 10);
    private static final Font FONT_NORMAL = FontFactory.getFont(FontFactory.COURIER, 10);
    private static final String DASHED_LINE = "---------------------------------";

    public byte[] generateKotPdf(Order order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(THERMAL_ROLL_SIZE, 10, 10, 10, 10);
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. KOT Header
            Paragraph header = new Paragraph("KITCHEN ORDER TICKET\n", FONT_LARGE_BOLD);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 2. Order Metadata
            String timeStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"));

            document.add(new Paragraph("Type: " + order.getOrderType(), FONT_LARGE_BOLD));
            document.add(new Paragraph("Time: " + timeStr, FONT_NORMAL));
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 3. Items Table (Qty + Name only)
            PdfPTable itemsTable = new PdfPTable(new float[]{1f, 4f});
            itemsTable.setWidthPercentage(100);
            itemsTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            itemsTable.addCell(new Phrase("QTY", FONT_BOLD));
            itemsTable.addCell(new Phrase("ITEM", FONT_BOLD));

            document.add(itemsTable);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            // 4. Print Items
            PdfPTable itemRows = new PdfPTable(new float[]{1f, 4f});
            itemRows.setWidthPercentage(100);
            itemRows.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            for (OrderItem item : order.getItems()) {
                // Large font for quantity
                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), FONT_LARGE_BOLD));
                qtyCell.setBorder(Rectangle.NO_BORDER);
                itemRows.addCell(qtyCell);

                // Item name
                PdfPCell nameCell = new PdfPCell(new Phrase(item.getItemName(), FONT_BOLD));
                nameCell.setBorder(Rectangle.NO_BORDER);
                itemRows.addCell(nameCell);

                // Add a blank row for spacing between items
                itemRows.addCell(new Phrase(" ", FONT_NORMAL));
                itemRows.addCell(new Phrase(" ", FONT_NORMAL));
            }

            document.add(itemRows);
            document.add(new Paragraph(DASHED_LINE, FONT_NORMAL));

            Paragraph footer = new Paragraph("*** END OF KOT ***", FONT_BOLD);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating KOT PDF", e);
        }
    }
}