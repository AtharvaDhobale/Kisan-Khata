import React, { useState } from 'react';
import type { ProjectExpense } from '../utils/helpers';
import type { TranslationSet } from '../data/translations';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onClose: () => void;
  onSave: (expense: Omit<ProjectExpense, 'id'>) => void;
  t: TranslationSet;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSave, t }) => {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ProjectExpense['category']>('fertilizers');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    // Convert category like 'seeds' to key 'catSeeds'
    const catLabelKey = `cat${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof TranslationSet;

    onSave({
      amount: Number(amount),
      category,
      description: description.trim() || (t[catLabelKey] as string) || category,
      date
    });
  };

  const categories: { value: ProjectExpense['category']; labelKey: string }[] = [
    { value: 'seeds', labelKey: 'catSeeds' },
    { value: 'fertilizers', labelKey: 'catFertilizers' },
    { value: 'tractor', labelKey: 'catTractor' },
    { value: 'labor', labelKey: 'catLabor' },
    { value: 'irrigation', labelKey: 'catIrrigation' },
    { value: 'transport', labelKey: 'catTransport' },
    { value: 'rent', labelKey: 'catRent' },
    { value: 'misc', labelKey: 'catMisc' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t.addExpense}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-amount">{t.expenseAmount}</label>
              <input
                id="exp-amount"
                type="number"
                min="1"
                className="form-control"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="₹"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="exp-date">{t.expenseDate}</label>
              <input
                id="exp-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="exp-cat">{t.expenseCategory}</label>
            <select
              id="exp-cat"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {t[c.labelKey as keyof TranslationSet] || c.value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="exp-desc">{t.description}</label>
            <input
              id="exp-desc"
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Urea fertilizer buy, Tractor rental"
            />
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
