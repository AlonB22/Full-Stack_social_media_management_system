/*
  ===========================================
  DELETE CONFIRMATION MODAL COMPONENT
  ===========================================
  
  A small floating modal window that asks for confirmation
  before deleting a post.
*/

import './DeleteConfirmationModal.css';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2 className="delete-modal-title">Delete that post?</h2>
        </div>
        
        <div className="delete-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
