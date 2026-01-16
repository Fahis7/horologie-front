import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import { createPaymentIntent } from "../../api/orderservice";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePayment from "../common/components/StripePayment";

// --- INDIA STATE & DISTRICT DATA (Kept for fallback/validation) ---
const indianStates = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"]
};

const stripePromise = loadStripe("pk_test_51Qx1voEUCwI2OF5CLfus7TqEva3yinek9YwcdZVhLZp05cwL7YGGVdgciRGIA2xMISra9d7aj1wplFMmYFSRFEuQ003ao7Kxqx");

const Checkout = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isPinLoading, setIsPinLoading] = useState(false); // ✅ New Loading State

  const [formData, setFormData] = useState({
    full_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "",
    address: "",
    state: "", 
    city: "",  
    zip_code: "",
    phone: "",
  });

  const totalAmount = user?.cart?.reduce(
    (total, item) => total + item.product.price * item.quantity, 0
  ) || 0;

  useEffect(() => {
    if (!isPaymentSuccess && user?.cart?.length === 0) {
        navigate('/products');
        return;
    }

    if (totalAmount > 0) {
      createPaymentIntent()
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => {
            console.error(err);
            toast.error("Could not initialize secure payment");
        });
    }
  }, [totalAmount, user, navigate, isPaymentSuccess]);

  // ✅ NEW: AUTO-DETECT ADDRESS FROM PIN CODE
  useEffect(() => {
    const fetchPinDetails = async () => {
      // Only fetch if exactly 6 digits
      if (formData.zip_code.length === 6) {
        setIsPinLoading(true);
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.zip_code}`);
          const data = await response.json();
          
          if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            const fetchedState = postOffice.State;
            const fetchedDistrict = postOffice.District;

            // Update State and City automatically
            setFormData((prev) => ({
              ...prev,
              state: fetchedState,
              city: fetchedDistrict
            }));
            
            // Clear errors for these fields
            setErrors(prev => ({ ...prev, state: "", city: "", zip_code: "" }));
            toast.success("Location detected successfully.");
          } else {
            setErrors(prev => ({ ...prev, zip_code: "Invalid PIN Code." }));
            toast.error("Invalid PIN Code entered.");
          }
        } catch (error) {
          console.error("Pin fetch error", error);
        } finally {
          setIsPinLoading(false);
        }
      }
    };

    // Debounce slightly to avoid rapid API calls
    const timer = setTimeout(() => {
        fetchPinDetails();
    }, 500);

    return () => clearTimeout(timer);

  }, [formData.zip_code]);


  const validateField = (name, value) => {
    let errorMsg = "";
    
    switch (name) {
        case "phone":
            if (!/^\d{10}$/.test(value)) errorMsg = "Phone number must be exactly 10 digits.";
            break;
        case "zip_code":
            if (!/^\d{6}$/.test(value)) errorMsg = "PIN Code must be exactly 6 digits.";
            break;
        case "full_name":
            if (value.trim().length < 3) errorMsg = "Name is too short.";
            break;
        case "address":
            if (value.trim().length < 5) errorMsg = "Please enter a complete address.";
            break;
        default:
            break;
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if ((name === "phone" || name === "zip_code") && !/^\d*$/.test(value)) {
        return; 
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    if (name === "state") {
        setFormData(prev => ({ ...prev, state: value, city: "" }));
    }
  };

  const isFormValid = () => {
    return (
        formData.full_name &&
        formData.address &&
        formData.state &&
        formData.city &&
        formData.zip_code.length === 6 &&
        formData.phone.length === 10 &&
        Object.values(errors).every(err => !err)
    );
  };

  const handleSuccess = (newOrder) => {
    setIsPaymentSuccess(true);
    setUser({ ...user, cart: [] }); 
    toast.success("Acquisition Confirmed.");
    navigate("/confirmation", { state: { order: newOrder } });
  };

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: { colorPrimary: '#d4af37', colorText: '#333333' },
    },
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* LEFT: LUXURY VIDEO PANEL */}
      <div className="hidden md:block w-2/5 relative overflow-hidden sticky top-0 h-screen">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70 z-10"></div>
        <video
          autoPlay loop muted
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        >
          <source src="https://www.rado.com/media/sgecom_contentsystem/PDP_Images/Captain_Cook_HTC_Chronograph_chrono_bico_1920X1080.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-1/4 left-0 right-0 z-20 px-8 text-center">
          <p className="text-white font-light tracking-widest text-lg mb-2">"PRECISION IS THE SOUL OF TIMELESS ELEGANCE"</p>
          <p className="text-yellow-600 text-xs font-light opacity-80">- Master Horologist -</p>
        </div>
      </div>

      {/* RIGHT: CHECKOUT FORM */}
      <div className="w-full md:w-3/5 bg-white flex flex-col items-center justify-start p-8 sm:p-12 overflow-y-auto h-screen">
        <div className="max-w-md w-full py-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-thin tracking-widest text-gray-900 mb-1">SECURE ACQUISITION</h2>
            <p className="text-xs font-light text-gray-500 uppercase tracking-wide">Complete your collection</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 tracking-widest mb-4 border-b pb-2">SHIPPING DETAILS</h3>
            <div className="space-y-6">
                {/* Full Name */}
                <div>
                    <input type="text" name="full_name" placeholder="FULL NAME" value={formData.full_name} onChange={handleChange} className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent placeholder-gray-400 ${errors.full_name ? 'border-red-500' : 'border-gray-200 focus:border-yellow-600'}`} />
                    {errors.full_name && <p className="text-[10px] text-red-500 mt-1">{errors.full_name}</p>}
                </div>

                {/* Address */}
                <div>
                    <input type="text" name="address" placeholder="STREET ADDRESS (House No, Building, Street)" value={formData.address} onChange={handleChange} className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent placeholder-gray-400 ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-yellow-600'}`} />
                    {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* ✅ PIN CODE (Moved Up for Better UX) */}
                <div className="relative">
                    <input 
                        type="text" 
                        name="zip_code" 
                        placeholder="PIN CODE " 
                        maxLength="6" 
                        value={formData.zip_code} 
                        onChange={handleChange} 
                        className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent placeholder-gray-400 ${errors.zip_code ? 'border-red-500' : 'border-gray-200 focus:border-yellow-600'}`} 
                    />
                    {isPinLoading && <span className="absolute right-0 top-2 text-xs text-yellow-600 animate-pulse">Detecting...</span>}
                    {errors.zip_code && <p className="text-[10px] text-red-500 mt-1">{errors.zip_code}</p>}
                </div>

                {/* State & City (Auto-filled but editable) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* STATE */}
                    <div className="relative">
                        <select 
                            name="state" 
                            value={formData.state} 
                            onChange={handleChange} 
                            className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent text-gray-800 appearance-none ${!formData.state ? 'text-gray-400' : ''} ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-yellow-600'}`}
                        >
                            <option value="" disabled>SELECT STATE</option>
                            {Object.keys(indianStates).sort().map((state) => (
                                <option key={state} value={state} className="text-gray-800">{state}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>

                    {/* DISTRICT */}
                    <div className="relative">
                        {/* Using Input for City if detected via API to allow flexibility, or keep Select logic */}
                        {/* Here I kept the smart select logic, but it will auto-select if API returns match */}
                        <select 
                            name="city" 
                            value={formData.city} 
                            onChange={handleChange} 
                            disabled={!formData.state}
                            className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent text-gray-800 appearance-none ${!formData.city ? 'text-gray-400' : ''} ${!formData.state ? 'cursor-not-allowed opacity-50' : ''} border-gray-200 focus:border-yellow-600`}
                        >
                            <option value="" disabled>SELECT DISTRICT</option>
                            {formData.state && indianStates[formData.state]?.sort().map((dist) => (
                                <option key={dist} value={dist} className="text-gray-800">{dist}</option>
                            ))}
                            {/* Fallback if API returns a city not in our list, simply show it as an option */}
                            {formData.city && (!indianStates[formData.state] || !indianStates[formData.state].includes(formData.city)) && (
                                <option value={formData.city} className="text-gray-800">{formData.city}</option>
                            )}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <input type="text" name="phone" placeholder="PHONE" maxLength="10" value={formData.phone} onChange={handleChange} className={`w-full border-b py-2 text-sm focus:outline-none bg-transparent placeholder-gray-400 ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-yellow-600'}`} />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 p-6 rounded-sm">
             <h3 className="text-xs font-bold text-gray-900 tracking-widest mb-4">SUMMARY</h3>
             <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-sm font-medium text-gray-900">
               <span>TOTAL DUE</span>
               <span>₹{totalAmount.toLocaleString()}</span>
             </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 tracking-widest mb-4 border-b pb-2">PAYMENT METHOD</h3>
            
            {/* Payment Section - Disabled if Form Invalid */}
            {isFormValid() ? (
                clientSecret ? (
                   <Elements options={options} stripe={stripePromise}>
                      <StripePayment formData={formData} onSuccess={handleSuccess} />
                   </Elements>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-400">Establishing secure connection...</div>
                )
            ) : (
                <div className="bg-gray-100 p-4 text-center rounded-sm border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Please complete all shipping details correctly to unlock secure payment.</p>
                    <div className="h-10 bg-gray-300 w-full rounded cursor-not-allowed flex items-center justify-center text-white text-xs font-bold tracking-widest">
                        LOCKED
                    </div>
                </div>
            )}
          </div>

          <div className="flex items-center justify-center text-xxs font-light text-gray-400 uppercase tracking-widest">
            <svg className="h-3 w-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            256-BIT SSL ENCRYPTED TRANSACTION
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;