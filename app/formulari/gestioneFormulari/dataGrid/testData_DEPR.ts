// dataGrid/testData.ts

export type FormularioRecord = {
  numeroFormulario: string;
  dataEmissione: string;
  produttore: string;
  destinatario: string;
  trasportatore: string;
  filePaths?: {
    formulario?: string;
    scontrino?: string;
    buono?: string;
  };
};

export const formulariData: FormularioRecord[] = [
  {
    numeroFormulario: "ZHDV006574Z",
    dataEmissione: "2025-01-28",
    produttore: "PUBLIACQUA SPA",
    destinatario: "DIFE SPA",
    trasportatore: "DIFE SPA",
    filePaths: {
      formulario: "/files/ZHDV006574Z/formulario.pdf",
      scontrino: "/files/ZHDV006574Z/scontrino.pdf",
      buono: "/files/ZHDV006574Z/buono.pdf",
    },
  },
  {
    numeroFormulario: "JFXFH000152YF",
    dataEmissione: "2025-02-14",
    produttore: "ANICO PAPER FLEX SRL SOCIETA' UNIPERSONALE",
    destinatario: "DIFE S.P.A.",
    trasportatore: "DIFE S.P.A.",
    filePaths: {
      formulario: "/files/JFXFH000152YF/formulario.pdf",
      scontrino: "/files/JFXFH000152YF/scontrino.pdf",
      // buono assente
    },
  },
  {
    numeroFormulario: "JFXFH000187MC",
    dataEmissione: "2025-02-14",
    produttore: "APOLLO SRL",
    destinatario: "DIFE S.P.A.",
    trasportatore: "DIFE S.P.A.",
    filePaths: {
      formulario: "/files/JFXFH000187MC/formulario.pdf",
      buono: "/files/JFXFH000187MC/buono.pdf",
      // scontrino assente
    },
  },
  {
    numeroFormulario: "JFXFH000216WV",
    dataEmissione: "2025-02-17",
    produttore: "NICOLETTI S.P.A.",
    destinatario: "DIFE S.P.A.",
    trasportatore: "DIFE S.P.A.",
    filePaths: {
      scontrino: "/files/JFXFH000216WV/scontrino.pdf",
      buono: "/files/JFXFH000216WV/buono.pdf",
      // formulario assente
    },
  },
  {
    numeroFormulario: "ABC12345678",
    dataEmissione: "2025-03-01",
    produttore: "Example Produttore",
    destinatario: "Example Destinatario",
    trasportatore: "Example Trasportatore",
    filePaths: {
      formulario: "/files/ABC12345678/formulario.pdf",
      scontrino: "/files/ABC12345678/scontrino.pdf",
      buono: "/files/ABC12345678/buono.pdf",
    },
  },
  {
    numeroFormulario: "XYZ98765432",
    dataEmissione: "2025-03-02",
    produttore: "Alpha Corp",
    destinatario: "Beta Ltd",
    trasportatore: "Gamma Transport",
    filePaths: {
      formulario: "/files/XYZ98765432/formulario.pdf",
      scontrino: "/files/XYZ98765432/scontrino.pdf",
    },
  },
  {
    numeroFormulario: "LMN11122233",
    dataEmissione: "2025-03-05",
    produttore: "Delta Industries",
    destinatario: "Omega Group",
    trasportatore: "Sigma Logistics",
    filePaths: {
      formulario: "/files/LMN11122233/formulario.pdf",
      buono: "/files/LMN11122233/buono.pdf",
    },
  },
  {
    numeroFormulario: "QWE11223344",
    dataEmissione: "2025-03-07",
    produttore: "Tech Solutions",
    destinatario: "Global Partners",
    trasportatore: "Trans Global",
    filePaths: {
      scontrino: "/files/QWE11223344/scontrino.pdf",
      buono: "/files/QWE11223344/buono.pdf",
    },
  },
  {
    numeroFormulario: "ASD55667788",
    dataEmissione: "2025-03-09",
    produttore: "Modern Foods",
    destinatario: "City Distributors",
    trasportatore: "Fast Movers",
    filePaths: {
      formulario: "/files/ASD55667788/formulario.pdf",
      scontrino: "/files/ASD55667788/scontrino.pdf",
      buono: "/files/ASD55667788/buono.pdf",
    },
  },
  {
    numeroFormulario: "POI99887766",
    dataEmissione: "2025-03-10",
    produttore: "Sunrise Enterprises",
    destinatario: "Moonlight Trading",
    trasportatore: "Star Logistics",
    filePaths: {
      formulario: "/files/POI99887766/formulario.pdf",
    },
  },
  {
    numeroFormulario: "QAZ24681012",
    dataEmissione: "2025-03-11",
    produttore: "Innovative Tech",
    destinatario: "Future Mart",
    trasportatore: "Quick Logistics",
    filePaths: {
      scontrino: "/files/QAZ24681012/scontrino.pdf",
      buono: "/files/QAZ24681012/buono.pdf",
    },
  },
  {
    numeroFormulario: "WSX13579135",
    dataEmissione: "2025-03-12",
    produttore: "Prime Solutions",
    destinatario: "Elite Distributors",
    trasportatore: "Rapid Transport",
    filePaths: {
      formulario: "/files/WSX13579135/formulario.pdf",
      scontrino: "/files/WSX13579135/scontrino.pdf",
      buono: "/files/WSX13579135/buono.pdf",
    },
  },
  {
    numeroFormulario: "EDC11223344",
    dataEmissione: "2025-03-13",
    produttore: "Bright Foods",
    destinatario: "Metro Distributors",
    trasportatore: "Swift Transport",
    filePaths: {
      formulario: "/files/EDC11223344/formulario.pdf",
    },
  },
  {
    numeroFormulario: "RFV55667788",
    dataEmissione: "2025-03-14",
    produttore: "Green Energy",
    destinatario: "Urban Retailers",
    trasportatore: "Eco Logistics",
    filePaths: {
      scontrino: "/files/RFV55667788/scontrino.pdf",
    },
  },
  {
    numeroFormulario: "TGB99887766",
    dataEmissione: "2025-03-15",
    produttore: "Smart Manufacturing",
    destinatario: "Industrial Supply",
    trasportatore: "Express Shipping",
    filePaths: {
      buono: "/files/TGB99887766/buono.pdf",
    },
  },
  {
    numeroFormulario: "YHN24681012",
    dataEmissione: "2025-03-16",
    produttore: "Future Innovations",
    destinatario: "Tech Retail",
    trasportatore: "Speedy Couriers",
    filePaths: {
      formulario: "/files/YHN24681012/formulario.pdf",
      scontrino: "/files/YHN24681012/scontrino.pdf",
    },
  },
  {
    numeroFormulario: "UJM13579135",
    dataEmissione: "2025-03-17",
    produttore: "NextGen Solutions",
    destinatario: "Corporate Buyers",
    trasportatore: "Logistics Pro",
    filePaths: {
      formulario: "/files/UJM13579135/formulario.pdf",
      scontrino: "/files/UJM13579135/scontrino.pdf",
      buono: "/files/UJM13579135/buono.pdf",
    },
  },
  {
    numeroFormulario: "IKL11223344",
    dataEmissione: "2025-03-18",
    produttore: "Mega Industries",
    destinatario: "Wholesale Traders",
    trasportatore: "Heavy Haul",
    filePaths: {
      formulario: "/files/IKL11223344/formulario.pdf",
    },
  },
  {
    numeroFormulario: "OLP55667788",
    dataEmissione: "2025-03-19",
    produttore: "Dynamic Foods",
    destinatario: "Local Markets",
    trasportatore: "Quick Transport",
    filePaths: {
      scontrino: "/files/OLP55667788/scontrino.pdf",
      buono: "/files/OLP55667788/buono.pdf",
    },
  },
  {
    numeroFormulario: "PLM99887766",
    dataEmissione: "2025-03-20",
    produttore: "Urban Tech",
    destinatario: "City Consumers",
    trasportatore: "Metro Logistics",
    filePaths: {
      formulario: "/files/PLM99887766/formulario.pdf",
      scontrino: "/files/PLM99887766/scontrino.pdf",
      buono: "/files/PLM99887766/buono.pdf",
    },
  },
  {
    numeroFormulario: "OKN24681012",
    dataEmissione: "2025-03-21",
    produttore: "Alpha Manufacturing",
    destinatario: "Beta Supply",
    trasportatore: "Gamma Freight",
    filePaths: {
      scontrino: "/files/OKN24681012/scontrino.pdf",
    },
  },
  {
    numeroFormulario: "IJU13579135",
    dataEmissione: "2025-03-22",
    produttore: "Superior Brands",
    destinatario: "Premium Distributors",
    trasportatore: "Elite Shippers",
    filePaths: {
      formulario: "/files/IJU13579135/formulario.pdf",
      buono: "/files/IJU13579135/buono.pdf",
    },
  },
  {
    numeroFormulario: "KOL11223344",
    dataEmissione: "2025-03-23",
    produttore: "Quality Goods",
    destinatario: "Reliable Retail",
    trasportatore: "Fast Freight",
    filePaths: {
      formulario: "/files/KOL11223344/formulario.pdf",
      scontrino: "/files/KOL11223344/scontrino.pdf",
    },
  },
  {
    numeroFormulario: "MKI55667788",
    dataEmissione: "2025-03-24",
    produttore: "Creative Labs",
    destinatario: "Innovative Markets",
    trasportatore: "LogiFast",
    filePaths: {
      formulario: "/files/MKI55667788/formulario.pdf",
      scontrino: "/files/MKI55667788/scontrino.pdf",
      buono: "/files/MKI55667788/buono.pdf",
    },
  },
  {
    numeroFormulario: "NJI99887766",
    dataEmissione: "2025-03-25",
    produttore: "Visionary Corp",
    destinatario: "Next Retail",
    trasportatore: "SpeedShip",
    filePaths: {
      buono: "/files/NJI99887766/buono.pdf",
    },
  },
];
