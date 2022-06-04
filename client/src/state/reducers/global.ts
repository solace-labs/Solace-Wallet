import {AccountStatus} from '../contexts/GlobalContext';

const reducer = (state: any, action: {type: string; payload: any}) => {
  const {type, payload} = action;
  switch (type) {
    case 'SET_USER':
      return {
        ...state,
        user: payload,
      };
    case 'SET_ACCOUNT_STATUS':
      return {
        ...state,
        accountStatus: payload,
      };
    case 'SET_ONBOARDING_USER':
      return {
        ...state,
        onboardingUser: payload,
      };
    case 'CHANGE_NAME':
      return {...state, username: action.payload};
    case 'ADD_CONTACT':
      return {...state, contacts: [...state.contacts, action.payload]};
    case 'GET_CONTACT':
      return {
        ...state,
        contact: state.contacts.find(
          (contact: any) => contact.id === action.payload,
        ),
      };
    default:
      return state;
  }
};

export default reducer;
