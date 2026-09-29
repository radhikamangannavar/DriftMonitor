import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./settings.css";

const OrganizationSettingsPage = () => {
  const [organization, setOrganization] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    industry: "",
    companySize: "",
    website: "",
    country: "",
    timezone: "Asia/Kolkata",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberError, setMemberError] = useState("");

  // Add member
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });

  // Pending role change
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [roleSaving, setRoleSaving] = useState(false);

  // Current logged-in user
  const currentUser = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );

  const currentUserId = currentUser?.userId;

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await api.get("/organizations/me");

        const data = response.data;

        setOrganization(data);

        setForm({
          name: data.name || "",
          slug: data.slug || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
          website: data.website || "",
          country: data.country || "",
          timezone: data.timezone || "Asia/Kolkata",
          description: data.description || "",
        });
      } catch (err) {
        setError(
          err.message ||
            "Failed to load organization information."
        );
      } finally {
        setLoading(false);
      }
    };

    const loadMembers = async () => {
      try {
        const response = await api.get("/users/members");

        setMembers(response.data || []);
      } catch (err) {
        setMemberError(
          err.message ||
            "Failed to load organization members."
        );
      } finally {
        setMembersLoading(false);
      }
    };

    loadOrganization();
    loadMembers();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleMemberChange = (event) => {
    setMemberForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.patch(
        "/organizations/me",
        form
      );

      setOrganization(response.data);

      setMessage(
        "Organization information updated."
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to update organization information."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    setMemberSaving(true);
    setMemberError("");

    try {
      const response = await api.post(
        "/users/members",
        memberForm
      );

      setMembers((current) => [
        ...current,
        response.data,
      ]);

      setMemberForm({
        name: "",
        email: "",
        password: "",
        role: "viewer",
      });

      setShowMemberForm(false);
    } catch (err) {
      setMemberError(
        err.message ||
          "Failed to add member."
      );
    } finally {
      setMemberSaving(false);
    }
  };

  // Only opens the confirmation dialog.
  // It does NOT change the role yet.
  const handleRoleSelect = (member, newRole) => {
    if (newRole === member.role) {
      return;
    }

    setMemberError("");

    setPendingRoleChange({
      userId: member._id,
      memberName: member.name,
      currentRole: member.role,
      newRole,
    });
  };

  // Actually changes the role after confirmation.
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) {
      return;
    }

    setRoleSaving(true);
    setMemberError("");

    try {
      const response = await api.patch(
        `/users/members/${pendingRoleChange.userId}/role`,
        {
          role: pendingRoleChange.newRole,
        }
      );

      setMembers((current) =>
        current.map((member) =>
          member._id === pendingRoleChange.userId
            ? response.data
            : member
        )
      );

      setPendingRoleChange(null);
    } catch (err) {
      setMemberError(
        err.message ||
          "Failed to update member role."
      );
    } finally {
      setRoleSaving(false);
    }
  };

  const cancelRoleChange = () => {
    if (roleSaving) {
      return;
    }

    setPendingRoleChange(null);
  };

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm(
      "Remove this member from the organization?"
    );

    if (!confirmed) {
      return;
    }

    setMemberError("");

    try {
      await api.delete(
        `/users/members/${userId}`
      );

      setMembers((current) =>
        current.filter(
          (member) => member._id !== userId
        )
      );
    } catch (err) {
      setMemberError(
        err.message ||
          "Failed to remove member."
      );
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        Loading organization...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="settings-page">
        <div className="settings-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">

      {/* ==================================================
          INTRO
      ================================================== */}

      <div className="settings-intro">
        <div>
          <span className="settings-kicker">
            ORGANIZATION
          </span>

          <h1>Company profile</h1>

          <p>
            Manage the organization information used
            across your DriftMonitor workspace.
          </p>
        </div>
      </div>

      {/* ==================================================
          COMPANY INFORMATION
      ================================================== */}

      <section className="settings-section">

        <div className="settings-section-heading">
          <h2>Company information</h2>

          <p>
            Basic details about your organization.
          </p>
        </div>

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >

          <div className="settings-grid">

            <label>
              <span>Company name</span>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Organization slug</span>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Industry</span>

              <input
                name="industry"
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. FinTech"
              />
            </label>

            <label>
              <span>Company size</span>

              <select
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
              >
                <option value="">
                  Select company size
                </option>

                <option value="1-10">
                  1–10
                </option>

                <option value="11-50">
                  11–50
                </option>

                <option value="51-200">
                  51–200
                </option>

                <option value="201-500">
                  201–500
                </option>

                <option value="501-1000">
                  501–1,000
                </option>

                <option value="1001-5000">
                  1,001–5,000
                </option>

                <option value="5001-10000">
                  5,001–10,000
                </option>

                <option value="10000+">
                  10,000+
                </option>
              </select>
            </label>

            <label>
              <span>Website</span>

              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </label>

            <label>
              <span>Country</span>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="India"
              />
            </label>

            <label>
              <span>Timezone</span>

              <input
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
              />
            </label>

          </div>

          <label className="settings-description">
            <span>Description</span>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Briefly describe your organization."
            />
          </label>

          {message && (
            <div className="settings-success">
              {message}
            </div>
          )}

          {error && (
            <div className="settings-error">
              {error}
            </div>
          )}

          <div className="settings-actions">
            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>

        </form>
      </section>

      {/* ==================================================
          MEMBERS
      ================================================== */}

      <section className="settings-section members-section">

        <div className="members-section-header">

          <div>
            <h2>Members</h2>

            <p>
              People who have access to this organization.
            </p>
          </div>

          <button
            type="button"
            className="member-add-button"
            onClick={() =>
              setShowMemberForm(
                (current) => !current
              )
            }
          >
            {showMemberForm
              ? "Cancel"
              : "Add member"}
          </button>

        </div>

        {/* ADD MEMBER FORM */}

        {showMemberForm && (
          <form
            className="member-form"
            onSubmit={handleAddMember}
          >

            <div className="member-form-grid">

              <label>
                <span>Name</span>

                <input
                  name="name"
                  value={memberForm.name}
                  onChange={handleMemberChange}
                  required
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  name="email"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                  required
                />
              </label>

              <label>
                <span>Temporary password</span>

                <input
                  type="password"
                  name="password"
                  value={memberForm.password}
                  onChange={handleMemberChange}
                  minLength={8}
                  required
                />
              </label>

              <label>
                <span>Role</span>

                <select
                  name="role"
                  value={memberForm.role}
                  onChange={handleMemberChange}
                >
                  <option value="viewer">
                    Viewer
                  </option>

                  <option value="analyst">
                    Analyst
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </label>

            </div>

            <div className="member-form-actions">

              <button
                type="submit"
                className="member-save-button"
                disabled={memberSaving}
              >
                {memberSaving
                  ? "Adding..."
                  : "Add member"}
              </button>

            </div>

          </form>
        )}

        {/* MEMBER ERROR */}

        {memberError && (
          <div className="settings-error">
            {memberError}
          </div>
        )}

        {/* MEMBER LIST */}

        {membersLoading ? (
          <div className="members-empty">
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div className="members-empty">
            No members found.
          </div>
        ) : (
          <div className="members-list">

            {members.map((member) => (
              <div
                className="member-row"
                key={member._id}
              >

                <div className="member-info">

                  <strong>
                    {member.name}

                    {member._id === currentUserId && (
                      <span className="member-you">
                        You
                      </span>
                    )}
                  </strong>

                  <span>
                    {member.email}
                  </span>

                </div>

                <div className="member-actions">

                  <select
                    className="member-role-select"
                    value={member.role}
                    onChange={(event) =>
                      handleRoleSelect(
                        member,
                        event.target.value
                      )
                    }
                    disabled={
                      member._id === currentUserId
                    }
                    aria-label={`Role for ${member.name}`}
                  >
                    <option value="admin">
                      Admin
                    </option>

                    <option value="analyst">
                      Analyst
                    </option>

                    <option value="viewer">
                      Viewer
                    </option>
                  </select>

                  <button
                    type="button"
                    className="member-remove-button"
                    onClick={() =>
                      handleRemoveMember(
                        member._id
                      )
                    }
                    disabled={
                      member._id === currentUserId
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* ==================================================
          ROLE CHANGE CONFIRMATION
      ================================================== */}

      {pendingRoleChange && (
        <div
          className="role-confirm-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !roleSaving
            ) {
              cancelRoleChange();
            }
          }}
        >
          <div
            className="role-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-confirm-title"
          >

            <span className="settings-kicker">
              PERMISSION CHANGE
            </span>

            <h3 id="role-confirm-title">
              Change member role?
            </h3>

            <p>
              Change{" "}
              <strong>
                {pendingRoleChange.memberName}
              </strong>{" "}
              from{" "}
              <strong>
                {pendingRoleChange.currentRole}
              </strong>{" "}
              to{" "}
              <strong>
                {pendingRoleChange.newRole}
              </strong>
              ?
            </p>

            <p className="role-confirm-warning">
              This will immediately change the
              permissions available to this member.
            </p>

            <div className="role-confirm-actions">

              <button
                type="button"
                className="role-cancel-button"
                onClick={cancelRoleChange}
                disabled={roleSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="role-confirm-button"
                onClick={confirmRoleChange}
                disabled={roleSaving}
              >
                {roleSaving
                  ? "Updating..."
                  : "Confirm change"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizationSettingsPage;