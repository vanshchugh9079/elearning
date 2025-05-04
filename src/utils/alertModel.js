// alertModal.js
import Swal from 'sweetalert2';

function AlertModal(options = {}) {
    const defaultOptions = {
        title: 'Alert',
        text: '',
        icon: 'info',
        confirmButtonText: 'OK',
        showCancelButton: false,
        cancelButtonText: 'Cancel',
        ...options,
    };

    return Swal.fire(defaultOptions);
}
export default AlertModal;
