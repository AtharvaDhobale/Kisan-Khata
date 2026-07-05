import React from 'react';
import type { FarmProject } from '../utils/helpers';
import { fetchMandiRates, cropBasePrices, locationData } from '../data/mandiData';
import type { TranslationSet } from '../data/translations';
import { MapPin, TrendingUp, TrendingDown, RefreshCw, BarChart2 } from 'lucide-react';

interface MandiWatchPanelProps {
  project: FarmProject;
  t: TranslationSet;
  onLocationChange: (state: string, district: string) => void;
  onDetectLocation: () => void;
  isLoadingLocation: boolean;
}

export const MandiWatchPanel: React.FC<MandiWatchPanelProps> = ({
  project,
  t,
  onLocationChange,
  onDetectLocation,
  isLoadingLocation
}) => {
  const crop = cropBasePrices[project.cropId];
  const mandiRecords = fetchMandiRates(project.state, project.district, project.cropId);
  
  // Calculate finances
  const totalExpense = project.expenses.reduce((sum, e) => sum + e.amount, 0);
  const costPerAcre = project.landArea > 0 ? totalExpense / project.landArea : 0;
  
  // Get active mandi price
  const activePrice = mandiRecords.length > 0 ? mandiRecords[0].modalPrice : 0;
  const estimatedRevenue = project.expectedYield * activePrice;
  const estimatedProfit = estimatedRevenue - totalExpense;
  const roi = totalExpense > 0 ? (estimatedProfit / totalExpense) * 100 : 0;
  const netMargin = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    const districts = locationData.find(l => l.state === newState)?.districts || [];
    const newDistrict = districts.length > 0 ? districts[0] : '';
    onLocationChange(newState, newDistrict);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLocationChange(project.state, e.target.value);
  };

  const currentDistricts = locationData.find(l => l.state === project.state)?.districts || [];

  return (
    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="panel-title">
        <span>
          <MapPin size={20} color="var(--accent-saffron)" />
          {t.marketPriceEngine}
        </span>
        <button
          onClick={onDetectLocation}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '11px' }}
          disabled={isLoadingLocation}
        >
          <RefreshCw size={12} className={isLoadingLocation ? 'spin-anim' : ''} />
          {t.detectLocation}
        </button>
      </div>

      {/* Geolocation selector dropdowns */}
      <div className="location-inputs">
        <div className="form-group">
          <label htmlFor="mandi-state">{t.state}</label>
          <select
            id="mandi-state"
            className="select-dropdown"
            value={project.state}
            onChange={handleStateChange}
            style={{ width: '100%' }}
          >
            {locationData.map((l) => (
              <option key={l.state} value={l.state}>
                {l.state}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mandi-district">{t.district}</label>
          <select
            id="mandi-district"
            className="select-dropdown"
            value={project.district}
            onChange={handleDistrictChange}
            style={{ width: '100%' }}
          >
            {currentDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t.nearbyMandis} ({t[crop.nameKey]})
        </h4>
        
        {mandiRecords.map((m, idx) => (
          <div key={idx} className="mandi-record-box">
            <div className="mandi-header">
              <span className="mandi-name">{m.mandiName}</span>
              <span className={`mandi-trend ${m.trend}`}>
                {m.trend === 'up' && <TrendingUp size={12} />}
                {m.trend === 'down' && <TrendingDown size={12} />}
                {m.trend.toUpperCase()}
              </span>
            </div>
            
            <div className="mandi-price-row">
              <div>
                <span className="mandi-price-value">₹{m.modalPrice}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                  /{t.perQuintal}
                </span>
              </div>
              <span className="mandi-price-range">
                ₹{m.minPrice} - ₹{m.maxPrice}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Arrivals: {m.arrivalTons} Quintals</span>
              <span>Updated: {m.lastUpdated}</span>
            </div>
          </div>
        ))}
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
          * {t.mandiSource}
        </p>
      </div>

      {/* Profitability Calculator */}
      <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart2 size={16} />
          Profitability Calculator
        </h4>

        <div className="metrics-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="metric-box saffron" style={{ padding: '12px' }}>
            <span className="metric-label" style={{ fontSize: '10px' }}>{t.estimatedRevenue}</span>
            <span className="metric-value" style={{ fontSize: '18px' }}>₹{Math.round(estimatedRevenue).toLocaleString('en-IN')}</span>
            <span className="metric-sub">{project.expectedYield} Quintals x ₹{activePrice}</span>
          </div>

          <div className={`metric-box ${estimatedProfit >= 0 ? '' : 'saffron'}`} style={{ padding: '12px', borderLeft: '4px solid ' + (estimatedProfit >= 0 ? 'var(--primary)' : '#ef4444') }}>
            <span className="metric-label" style={{ fontSize: '10px' }}>{t.estimatedProfit}</span>
            <span className="metric-value" style={{ fontSize: '18px', color: estimatedProfit >= 0 ? 'var(--primary-hover)' : '#fca5a5' }}>
              {estimatedProfit >= 0 ? '+' : ''}₹{Math.round(estimatedProfit).toLocaleString('en-IN')}
            </span>
            <span className="metric-sub">Revenue - Expenses</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.roi}:</span>
            <span style={{ fontWeight: 'bold', color: roi >= 0 ? 'var(--primary-hover)' : '#fca5a5' }}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.netMargin}:</span>
            <span style={{ fontWeight: 'bold', color: netMargin >= 0 ? 'var(--primary-hover)' : '#fca5a5' }}>
              {netMargin.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.costPerAcre}:</span>
            <span>₹{Math.round(costPerAcre).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.yieldPerAcre}:</span>
            <span>{(project.expectedYield / (project.landArea || 1)).toFixed(1)} Quintals</span>
          </div>
        </div>
      </div>
    </div>
  );
};
