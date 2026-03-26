import { FormModal } from "./Modal";

export function GuestRestrictionModal({ open, onClose, onSignIn }) {
  return (
    <FormModal open={open} onClose={onClose} title="Action Restricted">
      <div className="restriction-modal">
        <div className="restriction-modal__icon">
          <span className="material-symbols-outlined text-4xl text-accent mb-4">lock_person</span>
        </div>
        <h3 className="restriction-modal__title">Sign in to add your own entries</h3>
        <p className="restriction-modal__text">
          In demo mode, you're viewing a read-only sample collection. 
          To start building your own personalized list, please sign in or create an account.
        </p>
        <div className="restriction-modal__actions">
          <button className="btn-add w-full justify-center" onClick={onSignIn}>
            Sign In / Sign Up
          </button>
          <button className="btn-logout w-full mt-2" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }} onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </FormModal>
  );
}
