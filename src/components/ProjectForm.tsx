import React, { useState, useEffect } from 'react';
import type { FarmProject } from '../utils/helpers';
import { cropBasePrices, locationData } from '../data/mandiData';
import type { TranslationSet } from '../data/translations';
import { X } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
  onSave: (project: Omit<FarmProject, 'id' | 'expenses'>) => void;
  project?: FarmProject;
  t: TranslationSet;
  defaultState: string;
  defaultDistrict: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  onClose,
  onSave,
  project,
  t,
  defaultState,
  defaultDistrict
}) => {
  const [name, setName] = useState('');
  const [cropId, setCropId] = useState('wheat');
  const [landArea, setLandArea] = useState<number>(1);
  const [expectedYield, setExpectedYield] = useState<number>(15);
  const [sowingDate, setSowingDate] = useState('');
  const [budget, setBudget] = useState<number>(15000);
  const [status, setStatus] = useState<'ongoing' | 'harvested' | 'sold'>('ongoing');
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(defaultDistrict);
  const [useMarketPricing, setUseMarketPricing] = useState(true);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setCropId(project.cropId);
      setLandArea(project.landArea);
      setExpectedYield(project.expectedYield);
      setSowingDate(project.sowingDate);
      setBudget(project.budget);
      setStatus(project.status);
      setState(project.state);
      setDistrict(project.district);
      setUseMarketPricing(project.useMarketPricing);
    } else {
      // Set default sowing date to today
      const today = new Date().toISOString().split('T')[0];
      setSowingDate(today);
      setName('');
    }
  }, [project, defaultState, defaultDistrict]);

  // Adjust defaults when crop changes
  useEffect(() => {
    if (!project) {
      const base = cropBasePrices[cropId];
      if (base) {
        setBudget(base.standardCostPerAcre * landArea);
        setExpectedYield(base.avgYieldPerAcre * landArea);
      }
    }
  }, [cropId, landArea, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      cropId,
      landArea: Number(landArea) || 1,
      expectedYield: Number(expectedYield) || 10,
      sowingDate,
      budget: Number(budget) || 10000,
      status,
      state,
      district,
      useMarketPricing
    });
  };

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const stateConfig = locationData.find(l => l.state === selectedState);
    if (stateConfig && stateConfig.districts.length > 0) {
      setDistrict(stateConfig.districts[0]);
    }
  };

  const currentDistricts = locationData.find(l => l.state === state)?.districts || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{project ? t.editProject : t.addProject}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="proj-name">{t.projectName}</label>
            <input
              id="proj-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rabi Wheat 2026, Kharif Paddy"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-crop">{t.crop}</label>
              <select
                id="proj-crop"
                className="form-control"
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
              >
                {Object.keys(cropBasePrices).map((key) => (
                  <option key={key} value={key}>
                    {t[cropBasePrices[key].nameKey]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="proj-sowing">{t.sowingDate}</label>
              <input
                id="proj-sowing"
                type="date"
                className="form-control"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-area">{t.landArea}</label>
              <input
                id="proj-area"
                type="number"
                step="0.1"
                min="0.1"
                className="form-control"
                value={landArea}
                onChange={(e) => setLandArea(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="proj-yield">{t.expectedYield}</label>
              <input
                id="proj-yield"
                type="number"
                step="0.5"
                min="0.5"
                className="form-control"
                value={expectedYield}
                onChange={(e) => setExpectedYield(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-state">{t.state}</label>
              <select
                id="proj-state"
                className="form-control"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                {locationData.map((l) => (
                  <option key={l.state} value={l.state}>
                    {l.state}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="proj-district">{t.district}</label>
              <select
                id="proj-district"
                className="form-control"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {currentDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-budget">{t.budget}</label>
              <input
                id="proj-budget"
                type="number"
                min="0"
                className="form-control"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="proj-status">{t.status}</label>
              <select
                id="proj-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="ongoing">{t.statusOngoing}</option>
                <option value="harvested">{t.statusHarvested}</option>
                <option value="sold">{t.statusSold}</option>
              </select>
            </div>
          </div>

          <div className="market-toggle-panel">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useMarketPricing}
                onChange={(e) => setUseMarketPricing(e.target.checked)}
              />
              <span>{t.enableMarketAnalysis}</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
