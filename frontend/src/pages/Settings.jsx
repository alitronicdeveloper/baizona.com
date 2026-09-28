import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../lib/settings'

function Settings() {
  const [form, setForm] = useState(getSettings())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(getSettings())
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const update = (key, value) => setForm({ ...form, [key]: value })

  return (
    <div className="settings">
      {/* HERO */}
      <div className="hero">
        <div className="hero-header">
          <div>
            <div className="hero-hello">Mipangilio</div>
            <div className="hero-sub">Taarifa za duka lako</div>
          </div>
        </div>

        <div className="hero-note">
          Taarifa hizi zinaonekana kwenye risiti
        </div>
      </div>

      {/* CONTENT */}
      <form onSubmit={handleSubmit} className="content">

        {/* JINA LA DUKA */}
        <div className="field">
          <label className="field-label">Jina la Duka *</label>
          <input
            type="text"
            value={form.shopName}
            onChange={e => update('shopName', e.target.value)}
            required
            className="field-input"
            placeholder="Mfano: Juma Hardware"
          />
        </div>

        {/* ANWANI */}
        <div className="field">
          <label className="field-label">Anwani</label>
          <input
            type="text"
            value={form.shopAddress}
            onChange={e => update('shopAddress', e.target.value)}
            className="field-input"
            placeholder="Mfano: Kariakoo, Dar es Salaam"
          />
        </div>

        {/* SIMU */}
        <div className="field">
          <label className="field-label">Simu</label>
          <input
            type="tel"
            value={form.shopPhone}
            onChange={e => update('shopPhone', e.target.value)}
            className="field-input"
            placeholder="Mfano: 0712345678"
            inputMode="tel"
          />
        </div>

        {/* BARUA PEPE */}
        <div className="field">
          <label className="field-label">Barua Pepe</label>
          <input
            type="email"
            value={form.shopEmail}
            onChange={e => update('shopEmail', e.target.value)}
            className="field-input"
            placeholder="Mfano: duka@example.com"
            inputMode="email"
          />
        </div>

        {/* UJUMBE WA RISITI */}
        <div className="field">
          <label className="field-label">Ujumbe wa Risiti</label>
          <input
            type="text"
            value={form.receiptFooter}
            onChange={e => update('receiptFooter', e.target.value)}
            className="field-input"
            placeholder="Mfano: Asante kwa kununua!"
          />
        </div>

        {/* SAVE */}
        <button
          type="submit"
          className={`save-btn ${saved ? 'saved' : ''}`}
        >
          {saved ? '✓ IMEHIFADHIWA' : 'HIFADHI MIPANGILIO'}
        </button>

      </form>

      <style>{`
        .settings {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        /* HERO */
        .hero {
          background: linear-gradient(135deg, #1920A7 0%, #3047CD 50%, #232CC9 100%);
          border-radius: 16px 16px 28px 28px;
          margin: 0;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 18px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(25, 32, 167, 0.4);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 2px;
          color: #fff;
        }

        .hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }

        .hero-note {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          color: #fff;
          position: relative;
          z-index: 1;
        }

        /* CONTENT */
        .content {
          padding: 20px 0 100px;
        }

        /* FIELD */
        .field {
          margin-bottom: 14px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          padding: 16px 18px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .field-input::placeholder {
          color: #6B7280;
        }

        .field-input:focus {
          border-color: #F97316;
          background: #1F1F1F;
        }

        /* SAVE */
        .save-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
          transition: all 0.2s;
          margin-top: 12px;
        }

        .save-btn:active {
          transform: scale(0.98);
        }

        .save-btn.saved {
          background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
        }
      `}</style>
    </div>
  )
}

export default Settings
