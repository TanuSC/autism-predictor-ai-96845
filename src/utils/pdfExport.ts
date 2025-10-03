import { PredictionResult, PredictionInput } from '@/types/autism';

export const generatePDF = (
  prediction: PredictionResult,
  formData: PredictionInput
) => {
  // Create a comprehensive HTML document for printing
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Autism Screening Assessment Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #4A90E2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4A90E2;
      margin: 0;
    }
    .result-box {
      background: ${prediction.riskLevel === 'High' ? '#fee' : prediction.riskLevel === 'Medium' ? '#fef8e7' : '#e8f5e9'};
      border: 2px solid ${prediction.riskLevel === 'High' ? '#ef4444' : prediction.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e'};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .risk-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 18px;
      color: ${prediction.riskLevel === 'High' ? '#ef4444' : prediction.riskLevel === 'Medium' ? '#f59e0b' : '#22c55e'};
      border: 2px solid currentColor;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .info-item {
      text-align: center;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .info-item .value {
      font-size: 24px;
      font-weight: bold;
      color: #4A90E2;
    }
    .info-item .label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #4A90E2;
      border-bottom: 2px solid #4A90E2;
      padding-bottom: 10px;
    }
    .recommendation {
      background: #f0f7ff;
      border-left: 4px solid #4A90E2;
      padding: 15px;
      margin: 15px 0;
    }
    .strategy {
      margin: 15px 0;
    }
    .strategy h3 {
      color: #333;
      margin: 10px 0;
    }
    .strategy ul {
      margin: 5px 0;
      padding-left: 25px;
    }
    .strategy li {
      margin: 5px 0;
    }
    .disclaimer {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 30px 0;
    }
    .disclaimer strong {
      color: #856404;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 Autism Screening Assessment Results</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  </div>

  <div class="result-box">
    <div style="text-align: center; margin-bottom: 15px;">
      <span class="risk-badge">${prediction.riskLevel} Risk</span>
    </div>
    <div style="text-align: center;">
      <p style="font-size: 16px; margin: 10px 0;">
        <strong>Confidence Level:</strong> ${(prediction.confidence * 100).toFixed(1)}%
      </p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <div class="value">${formData.age}</div>
      <div class="label">Age (years)</div>
    </div>
    <div class="info-item">
      <div class="value">${formData.gender === 'M' ? 'Male' : 'Female'}</div>
      <div class="label">Gender</div>
    </div>
    <div class="info-item">
      <div class="value">${formData.responses.reduce((sum, r) => {
        const scores: Record<string, number> = { never: 0, rarely: 1, sometimes: 2, often: 3, always: 4 };
        return sum + scores[r];
      }, 0)}</div>
      <div class="label">Total Score</div>
    </div>
  </div>

  <div class="section">
    <h2>📋 Recommendation</h2>
    <div class="recommendation">
      <p>${prediction.recommendation}</p>
    </div>
  </div>

  <div class="section">
    <h2>🎯 Helpful Strategies & Support</h2>
    
    <div class="strategy">
      <h3>🗣️ Communication Support</h3>
      <ul>
        <li>Use clear, simple language and give your child extra time to respond</li>
        <li>Use visual aids like pictures or gestures to support understanding</li>
        <li>Practice turn-taking in conversations during daily activities</li>
        <li>Celebrate all communication attempts, verbal and non-verbal</li>
      </ul>
    </div>

    <div class="strategy">
      <h3>🤝 Social Skills Development</h3>
      <ul>
        <li>Arrange regular playdates with one or two peers in structured settings</li>
        <li>Practice social scenarios through role-play at home</li>
        <li>Use social stories to prepare for new situations</li>
        <li>Join parent-child groups focused on social skill building</li>
      </ul>
    </div>

    <div class="strategy">
      <h3>🎯 Sensory & Behavioral Support</h3>
      <ul>
        <li>Create a calm, predictable home environment with consistent routines</li>
        <li>Identify and minimize sensory triggers (loud noises, bright lights, textures)</li>
        <li>Provide sensory breaks and calming activities when needed</li>
        <li>Use positive reinforcement for desired behaviors</li>
      </ul>
    </div>

    <div class="strategy">
      <h3>📚 Learning & Development</h3>
      <ul>
        <li>Build on your child's strengths and special interests</li>
        <li>Break tasks into smaller, manageable steps</li>
        <li>Use visual schedules to support daily routines</li>
        <li>Incorporate play-based learning activities</li>
      </ul>
    </div>

    <div class="strategy">
      <h3>👨‍👩‍👧 Family Well-being</h3>
      <ul>
        <li>Connect with support groups for parents of children with similar needs</li>
        <li>Practice self-care and seek support when feeling overwhelmed</li>
        <li>Educate family members about your child's unique needs</li>
        <li>Celebrate small victories and progress</li>
      </ul>
    </div>

    <div class="strategy">
      <h3>⏱️ Next Steps Timeline</h3>
      <ul>
        <li><strong>Immediate:</strong> Start implementing the strategies above</li>
        <li><strong>Within 1-2 weeks:</strong> Schedule an appointment with your pediatrician</li>
        <li><strong>Within 1 month:</strong> Request a developmental evaluation if recommended</li>
        <li><strong>Ongoing:</strong> Track your child's progress and responses to interventions</li>
      </ul>
    </div>
  </div>

  <div class="disclaimer">
    <p><strong>Important Disclaimer:</strong></p>
    <p>This tool is for screening purposes only and should not replace professional medical diagnosis. 
    These strategies are general recommendations. Always consult with healthcare professionals 
    (pediatrician, developmental psychologist, or autism specialist) for personalized guidance 
    and proper evaluation.</p>
  </div>

  <div class="footer">
    <p>Autism Spectrum Disorder Prediction System</p>
    <p>This is a confidential document. Keep it secure and share only with relevant healthcare providers.</p>
  </div>
</body>
</html>
  `;

  // Create a new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};