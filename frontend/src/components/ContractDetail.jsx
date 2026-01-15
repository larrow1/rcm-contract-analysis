import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
  Shield,
  Activity,
  FileText,
  Loader,
  AlertCircle
} from 'lucide-react';
import { contractsAPI } from '../services/api';

const SectionCard = ({ icon: Icon, title, children, iconColor = "text-stripe-indigo" }) => (
  <div className="bg-white rounded-xl shadow-stripe border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-stripe-lg">
    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gray-100 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
    <div className="px-6 py-4">
      {children}
    </div>
  </div>
);

const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const ContractValueDisplay = ({ value }) => {
  if (!value || typeof value !== 'object') {
    return <span className="text-gray-400 italic">Not found</span>;
  }

  // Handle new schema with pricing_summary
  if (value.pricing_summary) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-900 font-medium">{value.pricing_summary}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {value.monthly_fee && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              Monthly: {formatCurrency(value.monthly_fee, value.currency)}
            </span>
          )}
          {value.percentage_rate && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {value.percentage_rate}% of collections
            </span>
          )}
          {value.per_encounter_fee && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
              Per encounter: {formatCurrency(value.per_encounter_fee, value.currency)}
            </span>
          )}
          {value.total_value && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
              Total: {formatCurrency(value.total_value, value.currency)}
            </span>
          )}
          {value.is_variable && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
              Variable pricing
            </span>
          )}
        </div>
      </div>
    );
  }

  // Handle old schema with amount field (backwards compatibility)
  if ('amount' in value) {
    if (value.amount !== null) {
      const formattedAmount = formatCurrency(value.amount, value.currency);
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 font-medium">{formattedAmount}</span>
          {value.is_estimate && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
              Estimate
            </span>
          )}
        </div>
      );
    }
    // Amount is null - show currency info if available
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-400 italic">Variable pricing (see additional notes)</span>
        {value.is_estimate && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
            Estimate
          </span>
        )}
      </div>
    );
  }

  return <span className="text-gray-400 italic">Not found</span>;
};

const DataField = ({ label, value, isList = false }) => {
  if (value === null || value === undefined) {
    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-400 italic">Not found</dd>
      </div>
    );
  }

  if (isList && Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="py-2">
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-400 italic">None specified</dd>
        </div>
      );
    }
    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1">
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-900">{item}</li>
            ))}
          </ul>
        </dd>
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="py-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </dd>
      </div>
    );
  }

  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </dd>
    </div>
  );
};

const ContractDetail = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const response = await contractsAPI.getContract(contractId);
        setContract(response.data);
      } catch (error) {
        console.error('Failed to fetch contract:', error);
        setError(error.response?.data?.detail || 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="w-8 h-8 text-stripe-indigo animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <p className="text-lg text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-stripe-indigo text-white rounded-lg hover:bg-stripe-indigo/90 transition-colors duration-200 font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!contract) {
    return null;
  }

  const analysis = contract.analysis?.extracted_data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-stripe border border-gray-200 p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contracts
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{contract.original_filename}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Uploaded on {new Date(contract.upload_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contract.status === 'completed' ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                Analysis Complete
              </span>
            ) : contract.status === 'processing' ? (
              <span className="px-3 py-1.5 bg-stripe-indigo/10 text-stripe-indigo rounded-full text-sm font-medium flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {contract.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {contract.status === 'completed' && analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Information */}
          {analysis.vendor_information && (
            <SectionCard icon={Building2} title="Vendor Information" iconColor="text-stripe-purple">
              <dl className="divide-y divide-gray-100">
                <DataField label="Vendor Name" value={analysis.vendor_information.vendor_name} />
                <DataField label="Contact" value={analysis.vendor_information.vendor_contact} />
                <DataField label="Address" value={analysis.vendor_information.vendor_address} />
                <DataField label="Tax ID" value={analysis.vendor_information.vendor_tax_id} />
              </dl>
            </SectionCard>
          )}

          {/* Financial Terms */}
          {analysis.financial_terms && (
            <SectionCard icon={DollarSign} title="Financial Terms" iconColor="text-emerald-600">
              <dl className="divide-y divide-gray-100">
                <div className="py-2">
                  <dt className="text-sm font-medium text-gray-500">Contract Value</dt>
                  <dd className="mt-1">
                    <ContractValueDisplay value={analysis.financial_terms.contract_value} />
                  </dd>
                </div>
                <DataField label="Payment Terms" value={analysis.financial_terms.payment_terms} />
                <DataField label="Payment Schedule" value={analysis.financial_terms.payment_schedule} />
                <DataField label="Pricing Model" value={analysis.financial_terms.pricing_model} />
                <DataField label="% of Collections" value={analysis.financial_terms.percentage_of_collections ? `${analysis.financial_terms.percentage_of_collections}%` : null} />
                <DataField label="Late Payment Penalties" value={analysis.financial_terms.late_payment_penalties} />
              </dl>
            </SectionCard>
          )}

          {/* Service Details */}
          {analysis.service_details && (
            <SectionCard icon={Briefcase} title="Service Details" iconColor="text-stripe-indigo">
              <dl className="divide-y divide-gray-100">
                <DataField label="Service Scope" value={analysis.service_details.service_scope} />
                <DataField label="Services Included" value={analysis.service_details.services_included} isList />
                <DataField label="Services Excluded" value={analysis.service_details.services_excluded} isList />
                <DataField label="Performance Metrics" value={analysis.service_details.performance_metrics} isList />
                <DataField label="SLAs" value={analysis.service_details.service_level_agreements} />
              </dl>
            </SectionCard>
          )}

          {/* Contract Terms */}
          {analysis.contract_terms && (
            <SectionCard icon={Calendar} title="Contract Terms" iconColor="text-amber-600">
              <dl className="divide-y divide-gray-100">
                <DataField label="Start Date" value={analysis.contract_terms.start_date} />
                <DataField label="End Date" value={analysis.contract_terms.end_date} />
                <DataField label="Duration" value={analysis.contract_terms.contract_duration} />
                <DataField label="Automatic Renewal" value={analysis.contract_terms.automatic_renewal} />
                <DataField label="Renewal Terms" value={analysis.contract_terms.renewal_terms} />
                <DataField label="Termination Clauses" value={analysis.contract_terms.termination_clauses} />
                <DataField label="Notice Period" value={analysis.contract_terms.notice_period} />
              </dl>
            </SectionCard>
          )}

          {/* Compliance & Legal */}
          {analysis.compliance_and_legal && (
            <SectionCard icon={Shield} title="Compliance & Legal" iconColor="text-rose-600">
              <dl className="divide-y divide-gray-100">
                <DataField label="HIPAA Compliance" value={analysis.compliance_and_legal.hipaa_compliance_mentioned} />
                <DataField label="HIPAA Requirements" value={analysis.compliance_and_legal.hipaa_requirements} />
                <DataField label="Data Security" value={analysis.compliance_and_legal.data_security_requirements} />
                <DataField label="Audit Rights" value={analysis.compliance_and_legal.audit_rights} />
                <DataField label="Liability Limitations" value={analysis.compliance_and_legal.liability_limitations} />
                <DataField label="Indemnification" value={analysis.compliance_and_legal.indemnification} />
                <DataField label="Insurance Requirements" value={analysis.compliance_and_legal.insurance_requirements} />
              </dl>
            </SectionCard>
          )}

          {/* RCM Specific */}
          {analysis.rcm_specific && (
            <SectionCard icon={Activity} title="RCM Specific Terms" iconColor="text-cyan-600">
              <dl className="divide-y divide-gray-100">
                <DataField label="Billing Services" value={analysis.rcm_specific.billing_services} isList />
                <DataField label="Coding Services" value={analysis.rcm_specific.coding_services} isList />
                <DataField label="Denial Management" value={analysis.rcm_specific.denial_management} />
                <DataField label="A/R Follow-up" value={analysis.rcm_specific.ar_follow_up} />
                <DataField label="Patient Collections" value={analysis.rcm_specific.patient_collections} />
                <DataField label="Expected Collection Rate" value={analysis.rcm_specific.expected_collection_rate ? `${analysis.rcm_specific.expected_collection_rate}%` : null} />
                <DataField label="Reporting Frequency" value={analysis.rcm_specific.reporting_frequency} />
                <DataField label="Technology Platform" value={analysis.rcm_specific.technology_platform} />
              </dl>
            </SectionCard>
          )}

          {/* Additional Notes */}
          {analysis.additional_notes && (
            <div className="lg:col-span-2">
              <SectionCard icon={FileText} title="Additional Notes" iconColor="text-gray-600">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis.additional_notes}</p>
              </SectionCard>
            </div>
          )}
        </div>
      ) : contract.status === 'failed' ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-sm text-gray-600">{contract.error_message || 'An error occurred during analysis'}</p>
        </div>
      ) : (
        <div className="bg-stripe-indigo/5 border border-stripe-indigo/10 rounded-xl p-8 text-center">
          <div className="bg-stripe-indigo/10 p-3 rounded-full w-fit mx-auto mb-4">
            <Loader className="w-10 h-10 text-stripe-indigo animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis in Progress</h3>
          <p className="text-sm text-gray-600">Your contract is being analyzed. This may take a few minutes...</p>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
