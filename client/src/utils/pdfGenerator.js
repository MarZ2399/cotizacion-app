// client/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoTwyford from '../assets/logo.png';

export const generarPDFCotizacion = (cotizacion) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // LOGO A LA IZQUIERDA
  doc.addImage(logoTwyford, 'PNG', 15, 10, 25, 20);

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
  doc.line(15, 30, 195, 30);

  // Información principal en 2 columnas
  const leftMargin = 15;
  const rightColumn = pageWidth / 2 + 10;
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
  doc.text(cotizacion.numeroDocumento || '-', rightColumn + 22, infoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('TELÉFONO:', rightColumn, infoY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.numeroContacto, rightColumn + 22, infoY + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', rightColumn, infoY + 10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(cotizacion.fecha).toLocaleDateString('es-PE');
  doc.text(fecha, rightColumn + 22, infoY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('ZONA:', rightColumn, infoY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(cotizacion.zona || '-', rightColumn + 22, infoY + 15);

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

  // GENERAR TABLA - OPTIMIZADA ✅
  doc.autoTable({
    startY: 56,
    margin: { left: 15, right: 15 },
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
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 1.5,
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 1.5,
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 46, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' }
    },
    tableWidth: 'wrap',
    rowPageBreak: 'avoid',
    didParseCell: function(data) {
      if (data.row.index === tableData.length - 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 8.5;
        data.cell.styles.fillColor = [200, 200, 200];
      }
    }
  });

  // ✅ SECCIÓN DE INFORMACIÓN ADICIONAL
  let finalY = doc.lastAutoTable.finalY + 5;

  // Texto de EPPs (cursiva)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0);
  const eppText = 'EL USO DE EPPS ES OBLIGATORIO PARA EL INGRESO A NUESTROS ALMACENES. (Zapato punta de acero, casco y mascarilla)';
  doc.text(eppText, pageWidth / 2, finalY, { align: 'center', maxWidth: 175 });

 // ✅ TABLA DE CUENTAS BANCARIAS - CORREGIDA
finalY += 8;

const cuentasData = [
  ['BCP', 'BCP SOLES - PAGO POR SERVICIO DE RECAUDACION\n*VENTANILLA: Indicar que la empresa TWYFORD PERU COMERCIAL COMPANY SCRL está afecta al SERVICIO DE RECAUDACION.\n*BANCA POR INTERNET: Pago a instituciones "TWYFORD PERU COMERCIAL COMPANY SCRL"'],
  ['BBVA', 'BBVA SOLES - PAGO POR SERVICIO DE RECAUDACION\n*BANCA MÓVIL APP: Pago de servicios "TWYFORD PERU COMERCIAL COMPANY SCRL"']
];

doc.autoTable({
  startY: finalY,
  head: [
    [{ content: 'CUENTAS BANCARIAS - TWYFORD PERU COMERCIAL COMPANY S.R.L', colSpan: 2, styles: { halign: 'center' } }]
  ],
  body: cuentasData,
  theme: 'grid',
  margin: { left: 15, right: 15 },
  headStyles: {
    fillColor: [255, 215, 0], // Amarillo
    textColor: [0, 0, 0],
    fontSize: 10,
    fontStyle: 'bold',
    halign: 'center',
    valign: 'middle',
    cellPadding: 2,
    lineWidth: 0.5,
    lineColor: [0, 0, 0]
  },
  bodyStyles: {
    fontSize: 7,
    cellPadding: 3,
    lineWidth: 0.5,
    lineColor: [0, 0, 0]
  },
  columnStyles: {
    0: { 
      cellWidth: 20, 
      halign: 'center', 
      valign: 'middle', 
      fontStyle: 'bold', 
      fillColor: [41, 84, 209], 
      textColor: 255 
    },
    1: { 
      cellWidth: 160, 
      halign: 'left', 
      valign: 'top' 
    }
  }
});


  // Obtener la posición final de la tabla de cuentas
  finalY = doc.lastAutoTable.finalY + 5;

// Título de Observaciones Comerciales
finalY += 5;
doc.setFontSize(9);
doc.setFont('helvetica', 'bolditalic');
doc.setTextColor(255, 0, 0);
doc.text('OBSERVACIONES COMERCIALES:', pageWidth / 2, finalY, { align: 'center' });

finalY += 5;

// ✅ TABLA DE OBSERVACIONES CON TEXTO JUSTIFICADO
const observacionesData = [
  ['1. LOS DEPOSITOS DEBEN INDICAR EL N° RUC o DNI CORRECTO, Y SE FACTURARÁN ACORDE A LO QUE INDICA EL DEPOSITO. SI ABONA CON N° DNI SE EMITIRÁ BOLETA.'],
  ['2. LOS PRECIOS VARIAN SEGÚN EL TIPO DE CAMBIO DE MANERA DIARIA'],
  ['3. LOS PRECIOS ESTÁN SUJETOS A VARIACIÓN SIN PREVIO AVISO, SON DEL DÍA Y DE ACUERDO A LA CANTIDAD INDICADA'],
  ['4. VALIDEZ DE LA COTIZACIÓN: 2 DÍAS'],
  ['5. ANTES DE REALIZAR EL PAGO, CONSULTAR EL STOCK DISPONIBLE'],
  ['6. PLAZO DE ENTREGA: PREVIA COORDINACIÓN'],
  ['7. ENVIAR LA TRANSFERENCIA O EL VOUCHER DEL DEPOSITO AL WHATSAPP DE VENDEDOR'],
  ['8. TODA MERCADERÍA SE RECOGE EN NUESTROS ALMACENES'],
  ['9. PARA EL DESPACHO DE MERCADERÍA EN NUESTROS ALMACENES EL USO DE EPPS ES OBLIGATORIO PARA EL CHOFER Y AYUDANTES. (Zapato punta de acero y casco) VENIR CON AYUDANTES PARA EL RECOJO/ENVIO DE VIDRIOS.'],
  ['10. PLAZO PARA RECOJO: 5 DÍAS CALENDARIOS, PASADO EL PLAZO EL DOCUMENTO EMITIDO SE ANULARÁ Y SE COTIZARÁ NUEVAMENTE CON PRECIOS VIGENTES.']
];

doc.autoTable({
  startY: finalY,
  body: observacionesData,
  theme: 'plain', // ← Sin bordes (invisible)
  margin: { left: 15, right: 15 },
  styles: {
    fontSize: 8,
    fontStyle: 'bold',
    textColor: [255, 0, 0],
    cellPadding: 1,
    lineColor: [255, 255, 255], // Bordes blancos (invisibles)
    lineWidth: 0
  },
  columnStyles: {
    0: { 
      cellWidth: 180, 
      halign: 'justify', // ← TEXTO JUSTIFICADO
      valign: 'top'
    }
  }
});

// Actualizar finalY después de la tabla
finalY = doc.lastAutoTable.finalY;


  // Footer (mantener en la parte inferior)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 0, 0);
  doc.text(`Cotización generada el ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Generar nombre del archivo
  const nombreArchivo = `Cotizacion_${cotizacion.numeroDocumento}_${cotizacion.empresa.nombre.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
};
