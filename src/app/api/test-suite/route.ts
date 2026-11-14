import { NextResponse } from 'next/server';
import { runTapCardPlatformTests } from '@/test/platform-e2e.test';

export async function GET() {
  try {
    const results = await runTapCardPlatformTests();
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length;

    return NextResponse.json({
      success: allPassed,
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

