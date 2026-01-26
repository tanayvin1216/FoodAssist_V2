'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Loader2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { sampleOrganizations } from '@/lib/utils/sampleData';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('directory');
  const [groupBy, setGroupBy] = useState('town');
  const [includeInactive, setIncludeInactive] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Report generated successfully! (Demo)');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Address', 'Town', 'ZIP', 'Phone', 'Services', 'Status'];
    const rows = sampleOrganizations.map((org) => [
      org.name,
      org.address,
      org.town,
      org.zip,
      org.phone,
      org.assistance_types.join('; '),
      org.is_active ? 'Active' : 'Inactive',
    ]);

    const csvContent =
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
        '\n'
      );

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-assistance-directory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate and export directory reports
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PDF Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Directory PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a formatted PDF directory of all food assistance
              organizations for printing or distribution.
            </p>

            <div className="space-y-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="directory">Full Directory</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="services">Services by Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="town">Town</SelectItem>
                    <SelectItem value="service">Service Type</SelectItem>
                    <SelectItem value="none">No Grouping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-inactive"
                  checked={includeInactive}
                  onCheckedChange={(checked) =>
                    setIncludeInactive(checked as boolean)
                  }
                />
                <Label htmlFor="include-inactive" className="font-normal">
                  Include inactive organizations
                </Label>
              </div>
            </div>

            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500">
              Note: PDF generation requires @react-pdf/renderer to be configured
              for production use.
            </p>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Export organization data as CSV or Excel for analysis or backup
              purposes.
            </p>

            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info('Excel export coming soon')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export as Excel
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-sm mb-2">Export includes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Organization details (name, address, contact)</li>
                <li>- Service types and populations served</li>
                <li>- Operating hours</li>
                <li>- Donation acceptance details</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Set up automatic report generation and email distribution to
            stakeholders.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> Automatic weekly/monthly report
              generation with email distribution to your stakeholder list.
              Configure this feature after connecting your email service
              (Resend/SendGrid).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center py-8">
            No reports generated yet. Generate your first report above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
