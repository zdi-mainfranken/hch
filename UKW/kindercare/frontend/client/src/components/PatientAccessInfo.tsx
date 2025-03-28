import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clipboard, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeCanvas } from 'qrcode.react';

interface PatientAccessInfoProps {
  pseudonymousId: string;
  passphrase: string;
}

const PatientAccessInfo = ({ pseudonymousId, passphrase }: PatientAccessInfoProps) => {
  const { toast } = useToast();
  const [patientEmail, setPatientEmail] = useState('');

  // QR code data (would contain a URL to the patient login page with passphrase)
  const qrCodeData = `${window.location.origin}/patient-login?passphrase=${passphrase}`;

  const handleCopyPassphrase = () => {
    navigator.clipboard.writeText(passphrase);
    toast({
      title: "Copied to clipboard",
      description: "The passphrase has been copied to your clipboard",
    });
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('patient-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${pseudonymousId}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-slate-700 mb-2">Patient Access</h3>
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="p-4 bg-white border rounded-md flex-1">
          <div className="flex flex-col items-center">
            <div className="bg-slate-100 p-2 rounded-md mb-2" id="qr-code-container">
              <QRCodeCanvas 
                id="patient-qr-code"
                value={qrCodeData} 
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="mr-1 h-4 w-4" /> Download QR
            </Button>
          </div>
        </div>
        <div className="p-4 bg-white border rounded-md flex-1">
          <div className="mb-3">
            <label htmlFor="passphrase" className="block text-sm font-medium text-slate-700 mb-1">
              Secure Passphrase
            </label>
            <div className="relative">
              <Input
                type="text"
                id="passphrase"
                value={passphrase}
                readOnly
                className="pr-10 bg-slate-50"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                onClick={handleCopyPassphrase}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="patient-email" className="block text-sm font-medium text-slate-700 mb-1">
              Patient Email (Optional)
            </label>
            <Input
              type="email"
              id="patient-email"
              placeholder="Enter patient email for access info"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAccessInfo;
