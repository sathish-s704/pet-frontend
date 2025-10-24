import React, { useEffect, useRef } from 'react';

const PayPalButton = ({ amount, onApprove, onError, onCancel }) => {
  const paypalRef = useRef(null);
  const isRendered = useRef(false);
  const containerIdRef = useRef(`paypal-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Clear any existing PayPal buttons
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
    isRendered.current = false;

    const loadPayPalScript = () => {
      if (window.paypal && !isRendered.current) {
        renderPayPalButtons();
        return;
      }

      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      script.async = true;
      script.onload = () => {
        if (!isRendered.current) {
          renderPayPalButtons();
        }
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        if (onError) {
          onError(new Error('Failed to load PayPal SDK'));
        }
      };
      document.body.appendChild(script);
    };

    const renderPayPalButtons = () => {
      if (isRendered.current || !paypalRef.current) return;
      
      try {
        isRendered.current = true;
        
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            console.log('=== PayPal CreateOrder ===');
            console.log('Amount to charge:', amount);
            console.log('USD equivalent:', (amount / 80).toFixed(2));
            
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: (amount / 80).toFixed(2), // Convert ₹ to approx USD
                },
              }],
            });
          },
          onApprove: async (data, actions) => {
            try {
              console.log('=== PayPal onApprove ===');
              console.log('PayPal onApprove triggered with data:', data);
              console.log('Actions object:', actions);
              
              const details = await actions.order.capture();
              console.log('Transaction completed successfully:', details);
              console.log('Transaction details:', {
                id: details.id,
                status: details.status,
                payer: details.payer
              });
              
              console.log('Calling onApprove callback with data:', data);
              if (onApprove) {
                await onApprove(data);
              }
            } catch (error) {
              console.error('=== PayPal Capture Error ===');
              console.error('Error capturing PayPal order:', error);
              if (onError) onError(error);
            }
          },
          onError: (err) => {
            console.error('=== PayPal Error ===');
            console.error('PayPal error details:', err);
            console.error('Error type:', typeof err);
            console.error('Error string:', err.toString());
            if (onError) onError(err);
          },
          onCancel: () => {
            console.log('=== PayPal Cancelled ===');
            console.log('PayPal payment cancelled by user');
            if (onCancel) onCancel();
          },
        }).render(paypalRef.current);
      } catch (error) {
        console.error('Error rendering PayPal buttons:', error);
        isRendered.current = false;
        if (onError) onError(error);
      }
    };

    const timer = setTimeout(loadPayPalScript, 100);

    return () => {
      clearTimeout(timer);
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
      isRendered.current = false;
    };
  }, [amount, onApprove, onError, onCancel]);

  return <div ref={paypalRef} id={containerIdRef.current}></div>;
};

export default PayPalButton;
