export const APP_NAME = "Fair-Trade Scanner";

export const PROCESSING_STEPS = [
  { id: 'upload', label: 'Image Preprocessing & Enhancement' },
  { id: 'segmentation', label: 'Instance Segmentation (U-Net)' },
  { id: 'features', label: 'Feature Extraction (Size, Color)' },
  { id: 'grading', label: 'Automated Grading Logic' },
  { id: 'certificate', label: 'Generating Certificate' },
];

export const GRADING_CRITERIA = {
  A: { defects: '< 5%', consistency: 'High' },
  B: { defects: '< 15%', consistency: 'Medium' },
  C: { defects: '> 15%', consistency: 'Low' },
};
