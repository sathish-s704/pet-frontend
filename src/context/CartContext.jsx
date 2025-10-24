import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

const initialState = {
  cartItems: loadCartFromStorage(),
};

function cartReducer(state, action) {
  console.log('Cart action:', action.type, action.payload);
  
  switch (action.type) {
    case 'ADD_TO_CART':
      const existing = state.cartItems.find(item => item._id === action.payload._id);
      if (existing) {
        console.log('Incrementing existing item');
        // Check stock before incrementing
        if (existing.quantity >= action.payload.totalStock) {
          console.warn('Cannot add more items - stock limit reached');
          return state; // Don't modify state if stock limit reached
        }
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item._id === existing._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        console.log('Adding new item to cart');
        // Check if product is in stock
        if (!action.payload.inStock || action.payload.totalStock === 0) {
          console.warn('Cannot add item - out of stock');
          return state; // Don't add if out of stock
        }
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
        };
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item._id !== action.payload),
      };
    case 'INCREMENT':
      return {
        ...state,
        cartItems: state.cartItems.map(item => {
          if (item._id === action.payload) {
            // Check stock before incrementing
            if (item.quantity >= item.totalStock) {
              console.warn('Cannot increment - stock limit reached');
              return item; // Don't increment if stock limit reached
            }
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        }),
      };
    case 'DECREMENT':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload.id
            ? { ...item, totalStock: action.payload.totalStock, inStock: action.payload.inStock }
            : item
        ),
      };
    case 'CLEAR_CART':
      console.log('Clearing cart');
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.cartItems]);

  // Enhanced dispatch function with API integration and stock validation
  const enhancedDispatch = async (action) => {
    try {
      switch (action.type) {
        case 'ADD_TO_CART':
          // Check current stock from the product data
          const product = action.payload;
          const existingItem = state.cartItems.find(item => item._id === product._id);
          
          if (existingItem && existingItem.quantity >= product.totalStock) {
            alert(`Cannot add more items. Only ${product.totalStock} items available for ${product.name}`);
            return;
          }
          
          if (!product.inStock || product.totalStock === 0) {
            alert(`${product.name} is currently out of stock`);
            return;
          }
          
          dispatch(action);
          break;

        case 'INCREMENT':
          const itemToIncrement = state.cartItems.find(item => item._id === action.payload);
          if (itemToIncrement && itemToIncrement.quantity >= itemToIncrement.totalStock) {
            alert(`Cannot add more items. Only ${itemToIncrement.totalStock} items available for ${itemToIncrement.name}`);
            return;
          }
          dispatch(action);
          break;

        default:
          dispatch(action);
          break;
      }
    } catch (error) {
      console.error('Error in cart action:', error);
      alert('Error updating cart. Please try again.');
    }
  };
  
  return (
    <CartContext.Provider value={{ cartItems: state.cartItems, dispatch: enhancedDispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
