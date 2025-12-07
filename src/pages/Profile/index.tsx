import { useEffect, useState } from "react";
import { 
  TextField, Button, Box, Avatar, Typography, Paper, Grid 
} from "@mui/material";
import { getProfile, updateProfile } from "../../api/profileService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();

      // Map backend structure into flat structure for UI
      setProfile({
        id: data.id,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone: data.user.phone,
        role: data.user.role,

        avatar: data.avatar,
        bio: data.bio,
        date_of_birth: data.date_of_birth,
        address: data.address,
        city: data.city,
        country: data.country,
        postal_code: data.postal_code,
      });

    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Convert back to backend format
      const payload = {
        avatar: profile.avatar,
        bio: profile.bio,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        postal_code: profile.postal_code,
        phone: profile.phone,
        first_name: profile.first_name,
        last_name: profile.last_name,
      };

      await updateProfile(payload);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading || !profile) return <p>Loading...</p>;

  return (
    <Paper sx={{ p: 4, maxWidth: 750, margin: "auto", borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
          {profile.first_name?.charAt(0) || "U"}
        </Avatar>

        <Box>
          <Typography variant="h4" fontWeight={700}>User Profile</Typography>
          <Typography variant="body2" color="text.secondary">
            Role: {profile.role}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        
        {/* EMAIL */}
        <Grid item xs={12}>
          <TextField
            label="Email"
            value={profile.email}
            fullWidth
            disabled
          />
        </Grid>

        {/* FIRST NAME */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            name="first_name"
            value={profile.first_name || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* LAST NAME */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            name="last_name"
            value={profile.last_name || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* PHONE */}
        <Grid item xs={12}>
          <TextField
            label="Phone"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* ADDRESS */}
        <Grid item xs={12}>
          <TextField
            label="Address"
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* CITY + COUNTRY */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            name="city"
            value={profile.city || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Country"
            name="country"
            value={profile.country || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* POSTAL CODE */}
        <Grid item xs={12}>
          <TextField
            label="Postal Code"
            name="postal_code"
            value={profile.postal_code || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* SAVE BUTTON */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ py: 1.5, fontSize: "1rem" }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Grid>

      </Grid>
    </Paper>
  );
}
