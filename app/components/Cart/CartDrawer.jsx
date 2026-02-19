import { Link, useFetcher } from 'react-router';
import { useEffect, useState } from 'react';

export default function CartDrawer({ isOpen, onClose, cart }) {
  const fetcher = useFetcher();
  const lines = cart?.lines?.nodes || [];

  // Sync with fetcher state to show "Adding..." or "Updating..."
  const isUpdating = fetcher.state !== 'idle';

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer Content */}
      <div className={`relative w-full max-w-md bg-[#fcfcfc] h-full shadow-2xl flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#111] text-white">
          <h2 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
            Your Cart
            <span className="text-xs font-normal text-gray-400 not-italic">
              ({cart?.totalQuantity || 0} ITEMS)
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <p className="text-lg text-gray-500 font-medium">Your cart is empty</p>
              <button
                onClick={onClose}
                className="bg-red-600 text-white font-bold py-3 px-8 rounded hover:bg-red-700 transition-colors uppercase italic"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            lines.map(line => (
              <div key={line.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 flex gap-4 relative">

                {/* Remove Button (Top Right) */}
                <fetcher.Form method="POST" action="/cart" className="absolute top-3 right-3">
                  <input type="hidden" name="action" value="remove" />
                  <input type="hidden" name="lineId" value={line.id} />
                  <button
                    type="submit"
                    className="text-gray-300 hover:text-red-500 transition-colors bg-transparent p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </fetcher.Form>

                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded shrink-0 flex items-center justify-center p-1">
                  <img src={line.merchandise.image?.url} alt={line.merchandise.product.title} className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between pr-6">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm uppercase italic tracking-tight">
                      {line.merchandise.product.title}
                    </h3>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs text-gray-500 mt-0.5">{line.merchandise.title}</p>
                    )}
                    <div className="text-red-600 font-bold text-sm mt-1">
                      ${parseFloat(line.merchandise.price.amount).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 rounded bg-white h-8">
                      <fetcher.Form method="POST" action="/cart" className="contents">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="quantity" value={Math.max(1, line.quantity - 1)} />
                        <button
                          type="submit"
                          className="px-2 text-gray-400 hover:text-gray-700 transition-colors h-full flex items-center"
                          disabled={isUpdating}
                        >
                          −
                        </button>
                      </fetcher.Form>
                      <span className="px-2 text-xs font-bold text-gray-900 min-w-[1.5rem] text-center">{line.quantity}</span>
                      <fetcher.Form method="POST" action="/cart" className="contents">
                        <input type="hidden" name="action" value="update" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <input type="hidden" name="quantity" value={line.quantity + 1} />
                        <button
                          type="submit"
                          className="px-2 text-gray-400 hover:text-gray-700 transition-colors h-full flex items-center"
                          disabled={isUpdating}
                        >
                          +
                        </button>
                      </fetcher.Form>
                    </div>

                    {/* Line Total */}
                    <span className="font-bold text-gray-900 text-sm">
                      ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-1">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Estimated Total</span>
              <span className="text-3xl font-black text-[#111] italic tracking-tighter loading-none">
                ${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mb-6 italic text-right">Shipping, taxes, and discounts calculated at checkout.</p>

            <a
              href={cart.checkoutUrl}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic py-4 rounded transition-all uppercase tracking-widest text-lg shadow-lg shadow-red-600/20 text-center flex items-center justify-center gap-2 mb-4"
            >
              Checkout Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-[#111] transition-colors"
            >
              View full bag
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
