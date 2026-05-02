// Filename: Frontend/src/pages/AdminPanel.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../utils/axiosClient";

const problemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.string().min(1, "Select a tag"),
  visibletestcases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required"),
    explanation: z.string().min(1, "Explanation is required")
  })).min(1, "At least one visible test case is required"),
  hiddentestcases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    output: z.string().min(1, "Output is required")
  })).min(1, "At least one hidden test case is required"),
  starterCode: z.array(z.object({
    language: z.enum(['JavaScript', 'Python', 'Java', 'C++']),
    intialCode: z.string().optional()
  })).min(1, "At least one starter code is required"),
  referenceSolution: z.array(z.object({
    language: z.enum(['JavaScript', 'Python', 'Java', 'C++']),
    completeCode: z.string().optional()
  })).superRefine((solutions, ctx) => {
    if (!solutions.some((sol) => sol.completeCode?.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one reference solution must contain code",
        path: ["referenceSolution"],
      });
    }
  }),
  driverCode: z.array(z.object({
    language: z.enum(['JavaScript', 'Python', 'Java', 'C++']),
    code: z.string().optional()
  })).optional(),
});

const S = {
  page:        { minHeight: "100vh", backgroundColor: "#1a1f2e", fontFamily: "sans-serif", padding: "40px 24px" },
  card:        { maxWidth: "860px", margin: "0 auto", backgroundColor: "#1e2433", borderRadius: "12px", border: "1px solid #2a2f3e", padding: "32px" },
  heading:     { fontSize: "22px", fontWeight: "700", color: "#f3f4f6", marginBottom: "32px" },
  section:     { marginBottom: "32px" },
  sectionHead: { fontSize: "16px", fontWeight: "600", color: "#f3f4f6", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #2a2f3e" },
  label:       { display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" },
  input:       { width: "100%", backgroundColor: "#252b3b", border: "1px solid #3a4050", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#f3f4f6", outline: "none", boxSizing: "border-box" },
  textarea:    { width: "100%", backgroundColor: "#252b3b", border: "1px solid #3a4050", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#f3f4f6", outline: "none", resize: "vertical", minHeight: "100px", boxSizing: "border-box" },
  select:      { width: "100%", backgroundColor: "#252b3b", border: "1px solid #3a4050", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#f3f4f6", outline: "none", cursor: "pointer" },
  error:       { color: "#f87171", fontSize: "12px", marginTop: "4px" },
  row:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  tcBox:       { backgroundColor: "#252b3b", border: "1px solid #3a4050", borderRadius: "10px", padding: "16px", marginBottom: "12px" },
  addBtn:      { background: "none", border: "1px dashed #3a4050", borderRadius: "8px", color: "#9ca3af", padding: "8px 16px", fontSize: "13px", cursor: "pointer", width: "100%", marginTop: "8px" },
  removeBtn:   { background: "none", border: "none", color: "#f87171", fontSize: "12px", cursor: "pointer", marginTop: "8px" },
  langLabel:   { fontSize: "13px", fontWeight: "600", color: "#a78bfa", marginBottom: "8px" },
  submitBtn:   { width: "100%", padding: "14px", backgroundColor: "#7c3aed", border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "8px" },
  infoBox:     { backgroundColor: "#1a2744", border: "1px solid #2a3f6e", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#93c5fd", marginBottom: "16px", lineHeight: "1.6" },
};

function AdminPanel() {
  const navigate = useNavigate();

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      visibletestcases: [{ input: "", output: "", explanation: "" }],
      hiddentestcases:  [{ input: "", output: "" }],
      starterCode: [
        { language: "JavaScript", intialCode: "" },
        { language: "Python",     intialCode: "" },
        { language: "Java",       intialCode: "" },
        { language: "C++",        intialCode: "" },
      ],
      referenceSolution: [
        { language: "JavaScript", completeCode: "" },
        { language: "Python",     completeCode: "" },
        { language: "Java",       completeCode: "" },
        { language: "C++",        completeCode: "" },
      ],
      driverCode: [
        { language: "JavaScript", code: "" },
        { language: "Python",     code: "" },
        { language: "Java",       code: "" },
        { language: "C++",        code: "" },
      ],
    }
  });

  const { fields: visiblefields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibletestcases" });
  const { fields: hiddenfields,  append: appendHidden,  remove: removeHidden  } = useFieldArray({ control, name: "hiddentestcases" });

  const onSubmit = async (data) => {
    try {
      const tagsValue = Array.isArray(data.tags)
        ? data.tags.filter(Boolean)
        : [data.tags].filter(Boolean);

      const filteredData = {
        ...data,
        tags: tagsValue,
        starterCode: data.starterCode.filter(s => s.intialCode?.trim() !== ""),
        referenceSolution: data.referenceSolution.filter(r => r.completeCode?.trim() !== ""),
        driverCode: data.driverCode.filter(d => d.code?.trim() !== ""),
      };
      await axiosClient.post("/problems/create", filteredData);
      alert("Problem created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error creating problem:", err.response?.data || err);
      alert(`Failed to create problem: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.heading}>Create New Problem</h1>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Basic Information ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Basic Information</p>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Title</label>
              <input style={S.input} placeholder="Problem title" {...register("title")} />
              {errors.title && <p style={S.error}>{errors.title.message}</p>}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Description</label>
              <textarea style={S.textarea} placeholder="Problem description..." {...register("description")} />
              {errors.description && <p style={S.error}>{errors.description.message}</p>}
            </div>
            <div style={S.row}>
              <div>
                <label style={S.label}>Difficulty</label>
                <select style={S.select} {...register("difficulty")}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.difficulty && <p style={S.error}>{errors.difficulty.message}</p>}
              </div>
              <div>
                <label style={S.label}>Tag</label>
                <select style={S.select} {...register("tags")}>
                  {['Array','String','Linked List','Tree','Graph','Dynamic Programming','Backtracking','Greedy','Sorting','Searching'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.tags && <p style={S.error}>{errors.tags.message}</p>}
              </div>
            </div>
          </div>

          {/* ── Visible Test Cases ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Visible Test Cases</p>
            {visiblefields.map((field, index) => (
              <div key={field.id} style={S.tcBox}>
                <div style={{ marginBottom: "10px" }}>
                  <textarea style={S.textarea} placeholder="Input" {...register(`visibletestcases.${index}.input`)} />
                  {errors.visibletestcases?.[index]?.input && <p style={S.error}>{errors.visibletestcases[index].input.message}</p>}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <input style={S.input} placeholder="Output" {...register(`visibletestcases.${index}.output`)} />
                  {errors.visibletestcases?.[index]?.output && <p style={S.error}>{errors.visibletestcases[index].output.message}</p>}
                </div>
                <div>
                  <input style={S.input} placeholder="Explanation" {...register(`visibletestcases.${index}.explanation`)} />
                  {errors.visibletestcases?.[index]?.explanation && <p style={S.error}>{errors.visibletestcases[index].explanation.message}</p>}
                </div>
                {visiblefields.length > 1 && (
                  <button type="button" style={S.removeBtn} onClick={() => removeVisible(index)}>Remove</button>
                )}
              </div>
            ))}
            {errors.visibletestcases?.message && <p style={S.error}>{errors.visibletestcases.message}</p>}
            <button type="button" style={S.addBtn} onClick={() => appendVisible({ input: "", output: "", explanation: "" })}>
              + Add Visible Test Case
            </button>
          </div>

          {/* ── Hidden Test Cases ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Hidden Test Cases</p>
            {hiddenfields.map((field, index) => (
              <div key={field.id} style={S.tcBox}>
                <div style={{ marginBottom: "10px" }}>
                  <textarea style={S.textarea} placeholder="Input" {...register(`hiddentestcases.${index}.input`)} />
                  {errors.hiddentestcases?.[index]?.input && <p style={S.error}>{errors.hiddentestcases[index].input.message}</p>}
                </div>
                <div>
                  <input style={S.input} placeholder="Output" {...register(`hiddentestcases.${index}.output`)} />
                  {errors.hiddentestcases?.[index]?.output && <p style={S.error}>{errors.hiddentestcases[index].output.message}</p>}
                </div>
                {hiddenfields.length > 1 && (
                  <button type="button" style={S.removeBtn} onClick={() => removeHidden(index)}>Remove</button>
                )}
              </div>
            ))}
            {errors.hiddentestcases?.message && <p style={S.error}>{errors.hiddentestcases.message}</p>}
            <button type="button" style={S.addBtn} onClick={() => appendHidden({ input: "", output: "" })}>
              + Add Hidden Test Case
            </button>
          </div>

          {/* ── Starter Code ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Starter Code</p>
            <div style={S.infoBox}>
              User ko yahi code dikhega editor mein. Sirf function signature likho — input/output driver code alag section mein hoga.
            </div>
            {["JavaScript", "Python", "Java", "C++"].map((lang, index) => (
              <div key={lang} style={{ ...S.tcBox, marginBottom: "12px" }}>
                <p style={S.langLabel}>{lang}</p>
                <input type="hidden" value={lang} {...register(`starterCode.${index}.language`)} />
                <textarea
                  style={{ ...S.textarea, minHeight: "120px", fontFamily: "monospace", fontSize: "13px" }}
                  placeholder={`Write ${lang} starter code here...`}
                  {...register(`starterCode.${index}.intialCode`)}
                />
                {errors.starterCode?.[index]?.intialCode && <p style={S.error}>{errors.starterCode[index].intialCode.message}</p>}
              </div>
            ))}
          </div>

          {/* ── Driver Code ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Driver Code (Input/Output Handler)</p>
            <div style={S.infoBox}>
              Yeh code user ko nahi dikhega. Yeh stdin se input parse karega, user ke function ko call karega, aur output print karega. User ke starter code ke saath automatically append hoga.
            </div>
            {["JavaScript", "Python", "Java", "C++"].map((lang, index) => (
              <div key={lang} style={{ ...S.tcBox, marginBottom: "12px" }}>
                <p style={S.langLabel}>{lang}</p>
                <input type="hidden" value={lang} {...register(`driverCode.${index}.language`)} />
                <textarea
                  style={{ ...S.textarea, minHeight: "140px", fontFamily: "monospace", fontSize: "13px" }}
                  placeholder={`Driver code for ${lang} — reads input, calls function, prints output...`}
                  {...register(`driverCode.${index}.code`)}
                />
              </div>
            ))}
          </div>

          {/* ── Reference Solution ── */}
          <div style={S.section}>
            <p style={S.sectionHead}>Reference Solution</p>
            <div style={S.infoBox}>
              Complete solution likho — function + driver code dono include karo yahan.
            </div>
            {["JavaScript", "Python", "Java", "C++"].map((lang, index) => (
              <div key={lang} style={{ ...S.tcBox, marginBottom: "12px" }}>
                <p style={S.langLabel}>{lang}</p>
                <input type="hidden" value={lang} {...register(`referenceSolution.${index}.language`)} />
                <textarea
                  style={{ ...S.textarea, minHeight: "120px", fontFamily: "monospace", fontSize: "13px" }}
                  placeholder={`Write complete ${lang} solution here...`}
                  {...register(`referenceSolution.${index}.completeCode`)}
                />
                {errors.referenceSolution?.[index]?.completeCode && <p style={S.error}>{errors.referenceSolution[index].completeCode.message}</p>}
              </div>
            ))}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            style={S.submitBtn}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6d28d9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7c3aed")}
          >
            Create Problem
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminPanel;