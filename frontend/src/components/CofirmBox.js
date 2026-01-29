import React from "react";

const variantClasses = {
  danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  primary: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
};

const CofirmBox = ({
  title = "Confirm Action",
  message = "Are you sure?",
  confirm,
  cancel,
  close,
  confirmButtonText = "Confirm",
  confirmButtonVariant = "primary",
}) => {
  const confirmClass =
    variantClasses[confirmButtonVariant] || variantClasses.primary;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={cancel || close}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmClass}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CofirmBox;
