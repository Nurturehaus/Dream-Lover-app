// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Test All Buttons Functionality', () => {
  test('systematically test every button in the app', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    console.log('🎯 STARTING COMPREHENSIVE BUTTON TEST');
    
    // Initial screenshot
    await page.screenshot({ path: 'test-results/button-test-start.png' });
    
    // Test all buttons on current page
    const testButton = async (selector, name) => {
      try {
        const button = page.locator(selector);
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled().catch(() => false);
        
        console.log(`\n🔘 Testing ${name}:`);
        console.log(`   Selector: ${selector}`);
        console.log(`   Visible: ${isVisible}`);
        console.log(`   Enabled: ${isEnabled}`);
        
        if (isVisible && isEnabled) {
          console.log(`   ✅ Clicking ${name}...`);
          await button.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot after click
          await page.screenshot({ path: `test-results/after-${name.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
          
          // Check if page changed
          const currentUrl = page.url();
          console.log(`   📍 URL after click: ${currentUrl}`);
          
          // Check for any new visible elements
          const allTestIds = await page.$$eval('[data-testid]', elements => 
            elements.map(el => el.getAttribute('data-testid'))
          );
          console.log(`   🏷️  Test IDs now visible: ${allTestIds.join(', ')}`);
          
          return true;
        } else {
          console.log(`   ❌ ${name} not clickable (visible: ${isVisible}, enabled: ${isEnabled})`);
          return false;
        }
      } catch (error) {
        console.log(`   💥 Error testing ${name}: ${error.message}`);
        return false;
      }
    };
    
    // Test all possible buttons systematically
    console.log('\n=== PHASE 1: ONBOARDING BUTTONS ===');
    
    // 1. Next/Get Started button
    await testButton('[data-testid="onboarding-next-button"]', 'Next/Get Started Button');
    
    // 2. Role selection buttons (may appear after first next click)
    await testButton('[data-testid="role-tracker-button"]', 'I Track My Cycle Button');
    await testButton('[data-testid="role-supporter-button"]', 'I Support My Partner Button');
    
    // Try clicking Next again after role selection
    await testButton('[data-testid="onboarding-next-button"]', 'Next Button After Role');
    
    // Continue through onboarding
    await testButton('[data-testid="onboarding-next-button"]', 'Next Button Step 3');
    await testButton('[data-testid="onboarding-next-button"]', 'Get Started Final Button');
    
    console.log('\n=== PHASE 2: NAVIGATION TABS ===');
    
    // Test navigation tabs
    await testButton('[data-testid="tab-home"]', 'Home Tab');
    await testButton('[data-testid="tab-calendar"]', 'Calendar Tab');
    await testButton('[data-testid="tab-log"]', 'Log Tab');
    await testButton('[data-testid="tab-insights"]', 'Insights Tab');
    await testButton('[data-testid="tab-settings"]', 'Settings Tab');
    
    console.log('\n=== PHASE 3: ACTION BUTTONS ===');
    
    // Test dashboard action buttons
    await testButton('[data-testid="log-period-button"]', 'Log Period Button');
    await testButton('[data-testid="log-symptoms-button"]', 'Log Symptoms Button');
    
    console.log('\n=== PHASE 4: GENERIC BUTTON SEARCH ===');
    
    // Find and test any other buttons by different selectors
    const buttonSelectors = [
      'button',
      '[role="button"]',
      'TouchableOpacity',
      '.button',
      '[type="button"]',
      '[type="submit"]'
    ];
    
    for (const selector of buttonSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        console.log(`\n🔍 Found ${buttons.length} elements matching "${selector}"`);
        
        for (let i = 0; i < Math.min(buttons.length, 5); i++) {
          const button = buttons[i];
          const text = await button.textContent().catch(() => 'No text');
          const isVisible = await button.isVisible();
          
          if (isVisible && text && text.trim()) {
            console.log(`   Testing generic button: "${text.trim()}"`);
            try {
              await button.click();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: `test-results/generic-button-${i}.png` });
            } catch (e) {
              console.log(`   Failed to click: ${e.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`Error testing ${selector}: ${error.message}`);
      }
    }
    
    console.log('\n=== PHASE 5: FINAL STATE CHECK ===');
    
    // Final screenshot and state check
    await page.screenshot({ path: 'test-results/button-test-final.png' });
    
    // Check current page state
    const finalUrl = page.url();
    const pageTitle = await page.title();
    const bodyText = await page.textContent('body');
    const allTestIds = await page.$$eval('[data-testid]', elements => 
      elements.map(el => el.getAttribute('data-testid'))
    );
    
    console.log('\n📊 FINAL STATE:');
    console.log(`   URL: ${finalUrl}`);
    console.log(`   Title: ${pageTitle}`);
    console.log(`   Body text length: ${bodyText ? bodyText.length : 0}`);
    console.log(`   Test IDs present: ${allTestIds.join(', ')}`);
    console.log(`   Page contains dashboard keywords: ${/dashboard|dream|lover|cycle/i.test(bodyText)}`);
    console.log(`   Page contains auth keywords: ${/sign|login|email|password/i.test(bodyText)}`);
    
    console.log('\n✅ BUTTON TESTING COMPLETE!');
  });
});