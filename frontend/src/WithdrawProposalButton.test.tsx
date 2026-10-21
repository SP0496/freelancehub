// @vitest-environment jsdom

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    cleanup,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { postJson } from './api'
import WithdrawProposalButton from './WithdrawProposalButton'

vi.mock('./api', () => ({
    postJson: vi.fn(),
    ApiError: class extends Error {},
}))

const postJsonMock = vi.mocked(postJson)

beforeEach(() => {
    vi.resetAllMocks()
})

afterEach(() => {
    cleanup()
})

describe('WithdrawProposalButton', () => {
    it('asks for confirmation before sending a request', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        expect(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        ).toBeTruthy()

        expect(postJsonMock).not.toHaveBeenCalled()
        expect(onWithdrawn).not.toHaveBeenCalled()
    })

    it('sends no request when withdrawal is cancelled', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Keep proposal',
            }),
        )

        expect(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        ).toBeTruthy()

        expect(
            screen.queryByRole('button', {
                name: 'Confirm withdrawal',
            }),
        ).toBeNull()

        expect(postJsonMock).not.toHaveBeenCalled()
        expect(onWithdrawn).not.toHaveBeenCalled()
    })

    it('withdraws the correct proposal with its version', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        postJsonMock.mockResolvedValue({
            id: 'proposal-456',
            status: 'WITHDRAWN',
        })

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        )

        await waitFor(() => {
            expect(onWithdrawn).toHaveBeenCalledTimes(1)
        })

        expect(postJsonMock).toHaveBeenCalledTimes(1)

        expect(postJsonMock).toHaveBeenCalledWith(
            '/api/v1/projects/project-123/proposals/proposal-456/withdraw',
            {
                version: 2,
            },
        )

        expect(screen.getByRole('status').textContent).toContain(
            'Proposal withdrawn.',
        )
    })
})