import { groupSkills } from "../utils/profile.js";

export default function Skills({ skills = [] }) {
  const groups = groupSkills(skills);
  if (!groups.length) return null;

  return (
    <section id="skills" className="section reveal">
      <div className="section__head">
        <p className="section__label">Skills</p>
        <h2 className="section__title">Technologies & tools</h2>
      </div>

      <div className="skills-grid">
        {groups.map((group) => (
          <div key={group.label} className="skills-group">
            <h3 className="skills-group__title">{group.label}</h3>
            <ul className="chip-list">
              {group.items.map((name) => (
                <li key={name} className="chip">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
