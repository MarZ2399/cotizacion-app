// client/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoTwyford from '../assets/logo.png';

export const generarPDFCotizacion = (cotizacion) => {
  const doc = new jsPDF('l', 'mm', 'letter');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // LOGO A LA IZQUIERDA
  doc.addImage(logoTwyford, 'PNG', 
    15,      // x (izquierda)
    10,      // y (arriba)
    25,      // ancho
    20       // alto
  );

  // HEADER CON DATOS EMPRESA - TODO CENTRADO
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TWYFORD PERU COMERCIAL COMPANY SCRL', pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RUC. 20613206885', pageWidth / 2, 17, { align: 'center' });
  doc.text('AV. STA ANA MZA. 114 URB. CHACRA CERRO LIMA - LIMA - COMAS', pageWidth / 2, 21, { align: 'center' });

  // Título COTIZACIÓN N°
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN N°', pageWidth / 2, 28, { align: 'center' });

  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.line(15, 30, pageWidth - 15, 30);

  // Información principal en 2 columnas
  const leftMargin = 15;
  const rightColumn = pageWidth / 2 + 25;
  let infoY = 36;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // COLUMNA IZQUIERDA
  doc.text('EMPRESA:', leftMargin, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.empresa.nombre, leftMargin + 22, infoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('RUC / DNI:', leftMargin, infoY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.empresa.ruc || '-', leftMargin + 22, infoY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PAIS:', leftMargin, infoY + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.pais, leftMargin + 22, infoY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACTO:', leftMargin, infoY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.nombreContacto, leftMargin + 22, infoY + 15);

  // COLUMNA DERECHA
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO:', rightColumn, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.numeroDocumento || '-', rightColumn + 18, infoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('TELÉFONO:', rightColumn, infoY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.numeroContacto, rightColumn + 18, infoY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', rightColumn, infoY + 10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(cotizacion.fecha).toLocaleDateString('es-PE');
  doc.text(fecha, rightColumn + 18, infoY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CIUDAD:', rightColumn, infoY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.empresa.ciudad || '-', rightColumn + 18, infoY + 15);

  // TABLA DE PRODUCTOS
  const tableData = [];
  
  cotizacion.productos.forEach((producto) => {
    tableData.push([
      producto.codigo,
      producto.descripcion,
      producto.piezasPorCajon?.toString() || '0',
      producto.cantidadPaquetes?.toString() || '0',
      (producto.piezasPorCajon * producto.cantidadPaquetes)?.toString() || '0',
      producto.cantidadPaquetes?.toString() || '0',
      `S/ ${producto.precioUnitario.toFixed(2)}`,
      `S/ ${producto.precioTotal.toFixed(2)}`
    ]);
  });

  const totalCajas = cotizacion.productos.reduce((sum, p) => sum + (p.cantidadPaquetes || 0), 0);

  // Fila de TOTAL CAJAS
  tableData.push([
    '',
    'TOTAL CAJAS',
    '',
    totalCajas.toString(),
    '',
    '',
    'TOTAL (S/)',
    `${cotizacion.totalGeneral.toFixed(2)}`
  ]);

  // GENERAR TABLA
  doc.autoTable({
    startY: 56,
    head: [[
      'CÓDIGO',
      'DESCRIPCIÓN',
      'PIEZAS POR CAJÓN',
      'CANTIDAD DE PAQUETES',
      'TOTAL DE PIEZAS',
      'PIEZAS',
      'PRECIO UNITARIO (S/)',
      'PRECIO TOTAL INCLUIDO IGV (S/)'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 84, 209],
      textColor: 255,
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 75, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 25, halign: 'right' },
      7: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Cotización generada el ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Generar nombre del archivo
  const nombreArchivo = `Cotizacion_${cotizacion.numeroDocumento}_${cotizacion.empresa.nombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
};
