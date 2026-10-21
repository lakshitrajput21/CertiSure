import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCertificates } from '../../context/CertificateContext';
import { Certificate } from '../../types/certificate';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { RevokeModal } from '../../components/certificates/RevokeModal';
import { formatDate } from '../../utils/dateUtils';
import {
  Search,
  Filter,
  FilePlus2,
  Ban,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { pdfService } from '../../services/pdfService';

type SortField = 'issueDate' | 'id' | 'holderName';
type SortDirection = 'asc' | 'desc';

export const CertificateManagementPage: React.FC = () => {
  const { certificates, revokeCertificate, isLoading } = useCertificates();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Revoke Modal state
  const [selectedCertForRevoke, setSelectedCertForRevoke] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (certId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/verify/${certId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(certId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered and sorted certificates
  const filteredCertificates = useMemo(() => {
    return certificates
      .filter((cert) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          cert.id.toLowerCase().includes(query) ||
          cert.holderName.toLowerCase().includes(query) ||
          cert.title.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' || cert.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [certificates, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage) || 1;
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(start, start + itemsPerPage);
  }, [filteredCertificates, currentPage]);

  const handleRevokeConfirm = async (reason: string) => {
    if (!selectedCertForRevoke) return;
    await revokeCertificate(selectedCertForRevoke.id, reason);
    setSelectedCertForRevoke(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Certificate Registry Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, inspect, and manage issued institutional credentials.
          </p>
        </div>

        <Link to="/institution/issue">
          <Button variant="primary" size="md" icon={<FilePlus2 size={16} />}>
            Issue New Certificate
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, candidate name, or degree..."
              icon={<Search size={16} />}
              className="py-2 text-sm"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter size={13} />
              Status:
            </span>
            {['ALL', 'VALID', 'REVOKED', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All Records' : st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Certificate Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold select-none">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>Certificate ID</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('holderName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Candidate Name</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Credential / Title
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('issueDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Issue Date</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Loading certificates...
                  </td>
                </tr>
              ) : paginatedCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No certificates matched the current criteria.
                  </td>
                </tr>
              ) : (
                paginatedCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <Link
                        to={`/institution/certificates/${cert.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {cert.id}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{cert.holderName}</div>
                      <div className="text-[11px] text-slate-400">{cert.holderEmail}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800 max-w-xs truncate">{cert.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{cert.type}</div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      <div>{formatDate(cert.issueDate)}</div>
                      {cert.expiryDate && (
                        <div className="text-[10px] text-slate-400">
                          Expires: {formatDate(cert.expiryDate)}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge status={cert.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/institution/certificates/${cert.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(cert.id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Copy Public Verification URL"
                        >
                          {copiedId === cert.id ? (
                            <Check size={15} className="text-emerald-600" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => pdfService.generateCertificatePdf(cert)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Specimen PDF"
                        >
                          <Download size={15} />
                        </button>

                        {cert.status === 'VALID' && (
                          <button
                            type="button"
                            onClick={() => setSelectedCertForRevoke(cert)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Revoke Certificate"
                          >
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold">{paginatedCertificates.length}</span> of{' '}
            <span className="font-semibold">{filteredCertificates.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Revocation Modal */}
      {selectedCertForRevoke && (
        <RevokeModal
          isOpen={!!selectedCertForRevoke}
          onClose={() => setSelectedCertForRevoke(null)}
          certificateId={selectedCertForRevoke.id}
          holderName={selectedCertForRevoke.holderName}
          onConfirm={handleRevokeConfirm}
        />
      )}
    </div>
  );
};
